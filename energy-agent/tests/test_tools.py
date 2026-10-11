"""
Automated Unit and Integration Tests for Energy Intelligence Tools.

Covers:
1. Normal Matching (Optimal candidate selection, score ranking)
2. Insufficient Market Supply (Demand > total active offers)
3. Feeder Capacity Headroom Violations (Line constraint rejects)
4. Invalid Inputs (Negative or zero kWh, empty offer lists)
5. Energy Balance & Allocation Consistency (allocated <= requested and allocated <= available)
6. Dynamic Pricing (Discounts, floor triggers, congestion shifts, boundary clamps)
7. Environmental Impact & Savings Calculation (CEA factor 0.54 kg/kWh, tree offsets)
"""

import pytest
from app.tools.pricing_tools import evaluate_pricing_rule_deterministic
from app.tools.matching_tools import match_energy_offers_deterministic
from app.tools.grid_tools import calculate_environmental_and_economic_impact_deterministic


@pytest.fixture
def sample_offers():
    return [
        {
            "id": "offer-hebbal",
            "seller_name": "Hebbal Solar Research Park",
            "grid_zone": "S1-North",
            "price_per_kwh": 5.80,
            "quantity_kwh": 15.0,
            "min_quantity_kwh": 2.0,
            "status": "active",
            "renewable_percentage": 99.5,
            "distance_km": 0.8
        },
        {
            "id": "offer-indiranagar",
            "seller_name": "Indiranagar Rooftop Co-op",
            "grid_zone": "S2-East",
            "price_per_kwh": 6.20,
            "quantity_kwh": 22.5,
            "min_quantity_kwh": 2.0,
            "status": "active",
            "renewable_percentage": 95.0,
            "distance_km": 1.2
        },
        {
            "id": "offer-koramangala",
            "seller_name": "Koramangala EV V2G",
            "grid_zone": "S3-South",
            "price_per_kwh": 6.75,
            "quantity_kwh": 4.0,
            "min_quantity_kwh": 1.0,
            "status": "active",
            "renewable_percentage": 92.0,
            "distance_km": 1.5
        },
        {
            "id": "offer-inactive",
            "seller_name": "Inactive Generator",
            "grid_zone": "S2-East",
            "price_per_kwh": 5.00,
            "quantity_kwh": 100.0,
            "min_quantity_kwh": 1.0,
            "status": "inactive",
            "renewable_percentage": 100.0,
            "distance_km": 0.1
        }
    ]


# --- Test Group 1: Normal Matching ---

def test_normal_matching_selects_optimal_offer(sample_offers):
    # Consumer in S2-East requests 5 kWh
    result = match_energy_offers_deterministic(
        offers_raw=sample_offers,
        consumer_zone="S2-East",
        requested_kwh=5.0
    )

    assert result["status"] == "FEASIBLE"
    assert result["best_match"] is not None
    assert result["allocated_kwh"] == 5.0
    assert result["unmet_kwh"] == 0.0
    assert result["is_simulation"] is True

    best = result["best_match"]
    # Indiranagar offer is in same zone S2-East with strong price and high purity
    assert best["offer"]["id"] in ["offer-indiranagar", "offer-hebbal"]
    assert best["is_feasible"] is True


def test_inactive_offers_are_marked_infeasible(sample_offers):
    result = match_energy_offers_deterministic(
        offers_raw=sample_offers,
        consumer_zone="S2-East",
        requested_kwh=5.0
    )

    # Inactive offer should be scored as infeasible
    inactive_matches = [
        item for item in result["ranked_offers"]
        if item["offer"]["id"] == "offer-inactive"
    ]
    assert len(inactive_matches) == 1
    assert inactive_matches[0]["is_feasible"] is False
    assert "not active" in inactive_matches[0]["feasibility_reason"].lower()


# --- Test Group 2: Insufficient Supply ---

def test_insufficient_supply_when_demand_exceeds_all_active_offers(sample_offers):
    # Total active quantity is 15 + 22.5 + 4 = 41.5 kWh
    huge_demand = 50.0
    result = match_energy_offers_deterministic(
        offers_raw=sample_offers,
        consumer_zone="S2-East",
        requested_kwh=huge_demand
    )

    assert result["status"] == "INFEASIBLE_SUPPLY"
    # Even if an offer is partially allocated, remaining is noted
    assert result["unmet_kwh"] > 0
    assert "insufficient" in result["summary"].lower()


# --- Test Group 3: Feeder Capacity Headroom Violations ---

def test_feeder_capacity_headroom_violation(sample_offers):
    # Feeder capacity 50 kWh, current load 48 kWh -> headroom is only 2 kWh
    # Requesting 5 kWh should trigger hard line capacity violation
    constraints = {"feeder_capacity_kwh": 50.0, "current_feeder_load_kwh": 48.0}
    result = match_energy_offers_deterministic(
        offers_raw=sample_offers,
        consumer_zone="S2-East",
        requested_kwh=5.0,
        feeder_constraints_dict=constraints
    )

    assert result["status"] == "INFEASIBLE_CAPACITY"
    assert result["best_match"] is None
    assert result["allocated_kwh"] == 0.0
    assert result["unmet_kwh"] == 5.0
    assert "headroom" in result["summary"].lower()


# --- Test Group 4: Invalid Inputs ---

def test_negative_or_zero_kwh_input(sample_offers):
    res_zero = match_energy_offers_deterministic(offers_raw=sample_offers, requested_kwh=0.0)
    assert res_zero["status"] == "INVALID_INPUT"
    assert res_zero["allocated_kwh"] == 0.0

    res_neg = match_energy_offers_deterministic(offers_raw=sample_offers, requested_kwh=-10.0)
    assert res_neg["status"] == "INVALID_INPUT"


def test_empty_offer_list():
    res = match_energy_offers_deterministic(offers_raw=[], requested_kwh=5.0)
    assert res["status"] == "INFEASIBLE_SUPPLY"
    assert res["best_match"] is None


# --- Test Group 5: Energy Balance & Allocation Consistency ---

def test_energy_balance_consistency(sample_offers):
    # Test varying requested amounts
    for req in [2.0, 5.0, 10.0, 20.0]:
        res = match_energy_offers_deterministic(
            offers_raw=sample_offers,
            requested_kwh=req,
            consumer_zone="S1-North"
        )
        # In all cases: allocated + unmet == requested
        assert round(res["allocated_kwh"] + res["unmet_kwh"], 2) == round(req, 2)
        # Allocated should never exceed requested
        assert res["allocated_kwh"] <= req
        if res["best_match"]:
            # Allocated should never exceed the matched offer's available quantity
            assert res["allocated_kwh"] <= float(res["best_match"]["offer"]["quantity_kwh"])


# --- Test Group 6: Dynamic Pricing Evaluations ---

def test_dynamic_pricing_undercut_and_floor():
    # 15% discount on 7.80 is 6.63. Above floor 5.50. Congestion 0.42 (no delta).
    res = evaluate_pricing_rule_deterministic(
        base_price=6.20,
        rule="Undercut grid by 15% and stay above ₹5.50/unit",
        grid_tariff=7.80,
        feed_in_rate=2.90,
        zone_congestion=0.42
    )
    assert res["final_price"] == 6.63
    assert res["buyer_savings_percent"] == 15
    assert res["seller_surplus_gain_percent"] > 0
    assert res["is_simulation"] is True


def test_dynamic_pricing_floor_protection():
    # 50% discount on 7.80 is 3.90, but floor is 5.80 -> must clamp to 5.80
    res = evaluate_pricing_rule_deterministic(
        base_price=6.20,
        rule="Undercut grid by 50% but stay above ₹5.80",
        grid_tariff=7.80,
        feed_in_rate=2.90,
        zone_congestion=0.42
    )
    assert res["final_price"] == 5.80
    assert any("Floor threshold triggered" in r for r in res["reasoning"])


def test_dynamic_pricing_high_congestion_premium():
    # High congestion > 0.6 adds +0.30
    res = evaluate_pricing_rule_deterministic(
        base_price=6.20,
        rule="Base price",
        grid_tariff=7.80,
        feed_in_rate=2.90,
        zone_congestion=0.75
    )
    assert res["final_price"] == 6.50
    assert any("congestion premium" in r.lower() for r in res["reasoning"])


def test_dynamic_pricing_regulatory_bounds():
    # Extreme lower price below feed-in rate + 0.50 (2.90 + 0.50 = 3.40)
    res = evaluate_pricing_rule_deterministic(
        base_price=1.00,
        rule="Floor > ₹1.00",
        grid_tariff=7.80,
        feed_in_rate=2.90,
        zone_congestion=0.10
    )
    assert res["final_price"] >= 3.40


# --- Test Group 7: Environmental & Economic Impact ---

def test_environmental_and_economic_impact():
    res = calculate_environmental_and_economic_impact_deterministic(
        quantity_kwh=10.0,
        grid_emission_factor_kg_per_kwh=0.54,
        grid_standard_tariff=7.80,
        purchased_price_per_kwh=6.00,
        wheeling_charge_per_kwh=0.15
    )

    # 10 * 0.54 = 5.40 kg CO2
    assert res["co2_avoided_kg"] == 5.40
    # 5.40 / 21.77 ~= 0.25 trees
    assert res["trees_equivalent"] == 0.25
    # Savings: (7.80 - 6.00) * 10 = 18.00 INR
    assert res["consumer_savings_inr"] == 18.00
    # Wheeling fee: 10 * 0.15 = 1.50 INR
    assert res["discom_wheeling_fee_inr"] == 1.50
    assert res["is_simulation"] is True


def test_environmental_impact_zero_kwh():
    res = calculate_environmental_and_economic_impact_deterministic(quantity_kwh=0.0)
    assert res["co2_avoided_kg"] == 0.0
    assert res["consumer_savings_inr"] == 0.0

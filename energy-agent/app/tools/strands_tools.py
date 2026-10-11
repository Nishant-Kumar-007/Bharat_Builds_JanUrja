"""
Strands @tool decorated wrappers for deterministic JanUrja energy calculation functions.

These tools are exposed to the AWS Strands Agent.
The agent MUST invoke these tools to obtain numerical, grid, and environmental results.
All calculations are strictly deterministic and originate from the verified tools.
"""

from typing import List, Dict, Any, Optional
from strands import tool

from app.tools.pricing_tools import evaluate_pricing_rule_deterministic
from app.tools.matching_tools import match_energy_offers_deterministic
from app.tools.grid_tools import calculate_environmental_and_economic_impact_deterministic


@tool(
    name="evaluate_pricing_rule",
    description="Evaluates a prosumer natural language pricing directive against grid tariffs, floor limits, and local zone congestion."
)
def evaluate_pricing_rule_tool(
    base_price: float = 6.20,
    rule: str = "Auto-price dynamically: Undercut grid tariff by 15% and stay above ₹5.50/unit.",
    grid_tariff: float = 7.80,
    feed_in_rate: float = 2.90,
    zone_congestion: float = 0.42
) -> Dict[str, Any]:
    """
    Evaluates dynamic pricing rule for a prosumer selling solar energy.

    Parameters:
        base_price: Baseline offer price per kWh in INR (e.g. 6.20)
        rule: Text constraint formulated by prosumer (e.g. undercut grid by 15%)
        grid_tariff: DISCOM peak retail tariff in INR (e.g. 7.80)
        feed_in_rate: Standard DISCOM net-metering feed-in compensation (e.g. 2.90)
        zone_congestion: 11kV Feeder line congestion factor between 0.0 and 1.0

    Returns:
        Dictionary with final_price, buyer_savings_percent, seller_surplus_gain_percent, reasoning list, and summary.
    """
    return evaluate_pricing_rule_deterministic(
        base_price=base_price,
        rule=rule,
        grid_tariff=grid_tariff,
        feed_in_rate=feed_in_rate,
        zone_congestion=zone_congestion
    )


@tool(
    name="match_energy_offers",
    description="Matches a consumer energy demand with active peer prosumer solar offers while enforcing hard feeder capacity and supply constraints."
)
def match_energy_offers_tool(
    offers: List[Dict[str, Any]],
    consumer_zone: str = "S2-East",
    requested_kwh: float = 5.0,
    feeder_capacity_kwh: float = 100.0,
    current_feeder_load_kwh: float = 30.0
) -> Dict[str, Any]:
    """
    Finds the optimal green energy match for a consumer.

    Parameters:
        offers: List of active solar offer objects
        consumer_zone: Consumer microgrid feeder zone (e.g. 'S1-North', 'S2-East', 'S3-South')
        requested_kwh: Energy quantity in kWh demanded by consumer
        feeder_capacity_kwh: Physical line rating limit of 11kV distribution feeder
        current_feeder_load_kwh: Current measured power flow on feeder before new trade

    Returns:
        Dictionary with status (FEASIBLE, INFEASIBLE_SUPPLY, INFEASIBLE_CAPACITY), best_match, ranked_offers, allocated_kwh, unmet_kwh, and summary.
    """
    feeder_constraints = {
        "feeder_capacity_kwh": feeder_capacity_kwh,
        "current_feeder_load_kwh": current_feeder_load_kwh
    }
    return match_energy_offers_deterministic(
        offers_raw=offers,
        consumer_zone=consumer_zone,
        requested_kwh=requested_kwh,
        feeder_constraints_dict=feeder_constraints
    )


@tool(
    name="calculate_environmental_and_economic_impact",
    description="Computes exact CO2 emissions offset, equivalent mature trees, consumer savings vs grid, and DISCOM wheeling fees."
)
def calculate_environmental_and_economic_impact_tool(
    quantity_kwh: float,
    grid_emission_factor_kg_per_kwh: float = 0.54,
    grid_standard_tariff: float = 7.80,
    purchased_price_per_kwh: float = 6.00,
    wheeling_charge_per_kwh: float = 0.15
) -> Dict[str, Any]:
    """
    Computes sustainability and financial metrics for a simulated clean energy trade.

    Parameters:
        quantity_kwh: Energy quantity in kWh
        grid_emission_factor_kg_per_kwh: Central Electricity Authority carbon factor (default 0.54)
        grid_standard_tariff: Standard DISCOM retail tariff (default 7.80)
        purchased_price_per_kwh: Agreed peer purchase price per kWh
        wheeling_charge_per_kwh: Transit wheeling fee per kWh payable to utility

    Returns:
        Dictionary with co2_avoided_kg, consumer_savings_inr, discom_wheeling_fee_inr, trees_equivalent, and summary.
    """
    return calculate_environmental_and_economic_impact_deterministic(
        quantity_kwh=quantity_kwh,
        grid_emission_factor_kg_per_kwh=grid_emission_factor_kg_per_kwh,
        grid_standard_tariff=grid_standard_tariff,
        purchased_price_per_kwh=purchased_price_per_kwh,
        wheeling_charge_per_kwh=wheeling_charge_per_kwh
    )


STRANDS_ENERGY_TOOLS = [
    evaluate_pricing_rule_tool,
    match_energy_offers_tool,
    calculate_environmental_and_economic_impact_tool,
]

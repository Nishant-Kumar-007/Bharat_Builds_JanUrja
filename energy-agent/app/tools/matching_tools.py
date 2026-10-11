"""
Deterministic Matching & Feasibility Tools for JanUrja.

Differentiates:
1. Hard Constraints (Feasibility Checks):
   - Active status check (must be 'active')
   - Requested kWh > 0 and valid inputs
   - Total available supply across active offers vs requested demand
   - Feeder capacity / transmission headroom (current load + requested kWh <= feeder capacity)
   - Offer minimum quantity check (requested_kwh >= min_quantity_kwh)

2. Soft Preferences (Ranking & Scoring):
   - Price score (0-100, normalized against typical ₹5.0-₹8.0/kWh band)
   - Distance score (0-100, normalized within 5.0 km)
   - Renewable purity (0-100%)
   - Zone locality bonus (100 for same feeder zone, 70 for inter-zone)
"""

from typing import List, Dict, Any, Optional
from app.models import EnergyOffer, MatchingWeights, FeederConstraints, ScoredOffer, MatchResult


def match_energy_offers_deterministic(
    offers_raw: List[Dict[str, Any]],
    consumer_zone: str = "S2-East",
    requested_kwh: float = 5.0,
    weights_dict: Optional[Dict[str, float]] = None,
    feeder_constraints_dict: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Evaluates peer solar offers against hard grid & supply constraints,
    then ranks feasible candidates using multi-attribute utility weights.
    """
    # 1. Input Validation
    if requested_kwh <= 0:
        return {
            "status": "INVALID_INPUT",
            "best_match": None,
            "ranked_offers": [],
            "requested_kwh": requested_kwh,
            "allocated_kwh": 0.0,
            "unmet_kwh": requested_kwh,
            "summary": "Invalid input: Requested energy quantity must be strictly greater than 0 kWh.",
            "is_simulation": True
        }

    if not offers_raw:
        return {
            "status": "INFEASIBLE_SUPPLY",
            "best_match": None,
            "ranked_offers": [],
            "requested_kwh": requested_kwh,
            "allocated_kwh": 0.0,
            "unmet_kwh": requested_kwh,
            "summary": "Infeasible: No prosumer solar offers currently available in the marketplace.",
            "is_simulation": True
        }

    # Normalize weights
    w = weights_dict or {"price": 0.40, "distance": 0.30, "renewable": 0.20, "congestion": 0.10}
    w_price = w.get("price", 0.40)
    w_dist = w.get("distance", 0.30)
    w_ren = w.get("renewable", 0.20)
    w_cong = w.get("congestion", 0.10)

    # 2. Hard Constraint Check: Feeder line capacity headroom
    fc = feeder_constraints_dict or {"feeder_capacity_kwh": 100.0, "current_feeder_load_kwh": 30.0}
    feeder_cap = float(fc.get("feeder_capacity_kwh", 100.0))
    current_load = float(fc.get("current_feeder_load_kwh", 30.0))
    available_headroom = max(0.0, feeder_cap - current_load)

    if requested_kwh > available_headroom:
        return {
            "status": "INFEASIBLE_CAPACITY",
            "best_match": None,
            "ranked_offers": [],
            "requested_kwh": requested_kwh,
            "allocated_kwh": 0.0,
            "unmet_kwh": requested_kwh,
            "summary": (
                f"Feeder constraint violation: Requested {requested_kwh:.2f} kWh exceeds remaining "
                f"11kV feeder line headroom ({available_headroom:.2f} kWh capacity available)."
            ),
            "is_simulation": True
        }

    # 3. Filter and check per-offer feasibility
    total_active_kwh = sum(
        float(o.get("quantity_kwh", 0))
        for o in offers_raw
        if str(o.get("status", "")).lower() == "active"
    )

    if total_active_kwh < requested_kwh:
        status_label = "INFEASIBLE_SUPPLY"
    else:
        status_label = "FEASIBLE"

    scored_offers: List[Dict[str, Any]] = []

    for raw_o in offers_raw:
        # Validate individual offer attributes
        price = float(raw_o.get("price_per_kwh", 6.5))
        dist = float(raw_o.get("distance_km", 1.0))
        renewable = float(raw_o.get("renewable_percentage", 90.0))
        qty = float(raw_o.get("quantity_kwh", 0.0))
        min_qty = float(raw_o.get("min_quantity_kwh", 0.5))
        status = str(raw_o.get("status", "active")).lower()
        zone = str(raw_o.get("grid_zone", "S1-North"))

        # Individual Feasibility check
        is_feasible = True
        feasibility_reasons = []

        if status != "active":
            is_feasible = False
            feasibility_reasons.append("Offer is not active")
        if qty < min_qty:
            is_feasible = False
            feasibility_reasons.append(f"Available quantity ({qty} kWh) below prosumer minimum lot ({min_qty} kWh)")
        if requested_kwh < min_qty:
            is_feasible = False
            feasibility_reasons.append(f"Requested purchase ({requested_kwh} kWh) below prosumer minimum lot ({min_qty} kWh)")

        # Scoring (even infeasible offers can be scored for diagnostic visibility, but feasible rank higher)
        # 1. Price Score: Lower is better (bounded between 5.0 and 8.0)
        price_score = max(0.0, min(100.0, ((8.0 - price) / (8.0 - 5.0)) * 100.0))
        # 2. Distance Score: Closer is better (bounded within 5.0 km)
        distance_score = max(0.0, min(100.0, ((5.0 - dist) / 5.0) * 100.0))
        # 3. Renewable Score (0-100)
        renewable_score = max(0.0, min(100.0, renewable))
        # 4. Locality Score
        is_same_zone = zone == consumer_zone
        locality_score = 100.0 if is_same_zone else 70.0

        total_score = round(
            (price_score * w_price) +
            (distance_score * w_dist) +
            (renewable_score * w_ren) +
            (locality_score * w_cong),
            2
        )

        match_reason = (
            f"Local feeder match in {zone} ({dist:.1f} km away) with {renewable:.1f}% solar purity"
            if is_same_zone
            else f"Substation-routed transfer from {zone} ({dist:.1f} km away) with {renewable:.1f}% solar purity"
        )

        feasibility_reason = "; ".join(feasibility_reasons) if feasibility_reasons else "All hard constraints satisfied"

        scored_offers.append({
            "offer": raw_o,
            "total_score": total_score,
            "price_score": round(price_score, 1),
            "distance_score": round(distance_score, 1),
            "renewable_score": round(renewable_score, 1),
            "locality_score": round(locality_score, 1),
            "match_reason": match_reason,
            "is_feasible": is_feasible,
            "feasibility_reason": feasibility_reason
        })

    # Sort feasible first by total score descending, then infeasible
    scored_offers.sort(key=lambda x: (1 if x["is_feasible"] else 0, x["total_score"]), reverse=True)

    # Determine allocation
    feasible_offers = [o for o in scored_offers if o["is_feasible"]]
    best_match = feasible_offers[0] if feasible_offers else None
    
    allocated = 0.0
    if best_match:
        avail = float(best_match["offer"].get("quantity_kwh", 0.0))
        allocated = min(requested_kwh, avail)
    
    unmet = max(0.0, round(requested_kwh - allocated, 2))

    if not best_match:
        status_label = "INFEASIBLE_SUPPLY"
        summary_msg = f"Insufficient market supply: No active offers available meeting lot requirements for {requested_kwh:.2f} kWh."
    elif status_label == "INFEASIBLE_SUPPLY":
        summary_msg = (
            f"Insufficient total market supply ({total_active_kwh:.2f} kWh available vs {requested_kwh:.2f} kWh requested). "
            f"Partial allocation: Best candidate {best_match['offer'].get('seller_name', 'Prosumer')} allocated {allocated:.2f} kWh, "
            f"leaving {unmet:.2f} kWh unmet."
        )
    else:
        summary_msg = (
            f"Optimal match selected: {best_match['offer'].get('seller_name', 'Prosumer')} "
            f"(Score: {best_match['total_score']}/100, Feeder: {best_match['offer'].get('grid_zone')}). "
            f"Allocated {allocated:.2f} kWh out of {requested_kwh:.2f} kWh requested."
        )

    return {
        "status": status_label,
        "best_match": best_match,
        "ranked_offers": scored_offers,
        "requested_kwh": requested_kwh,
        "allocated_kwh": allocated,
        "unmet_kwh": unmet,
        "summary": summary_msg,
        "is_simulation": True
    }

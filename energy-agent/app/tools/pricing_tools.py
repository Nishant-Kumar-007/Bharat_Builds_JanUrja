"""
Deterministic pricing tools for JanUrja prosumer energy offers.

Ported from JavaScript src/services/agenticEngine.js with enhanced robustness:
- Parses prosumer pricing directives (discounts, floor pricing)
- Factors in dynamic grid zone congestion
- Bounds pricing strictly between (feedInRate + 0.50) and (gridTariff - 0.20)
- Returns structured explanations and percentage savings
"""

import re
from typing import Dict, Any, List
from app.models import PricingRuleRequest, PricingRuleResponse


def evaluate_pricing_rule_deterministic(
    base_price: float = 6.20,
    rule: str = "Auto-price dynamically: Undercut grid tariff by 15% and stay above ₹5.50/unit.",
    grid_tariff: float = 7.80,
    feed_in_rate: float = 2.90,
    zone_congestion: float = 0.42
) -> Dict[str, Any]:
    """
    Evaluates prosumer natural language pricing rules and grid conditions to compute dynamic rates.
    This is a purely deterministic function with no random or stochastic behavior.
    """
    negotiated_price = float(base_price)
    lower_rule = (rule or "").lower()
    reasoning: List[str] = []

    # 1. Grid undercutting rule check
    if "undercut" in lower_rule or "below grid" in lower_rule:
        discount_match = re.search(r"(\d+)%", lower_rule)
        discount_percent = (float(discount_match.group(1)) / 100.0) if discount_match else 0.15
        discounted_price = grid_tariff * (1.0 - discount_percent)
        pct_display = round(discount_percent * 100)
        reasoning.append(
            f"Rule applied {pct_display}% discount below DISCOM peak tariff (₹{grid_tariff:.2f}) -> ₹{discounted_price:.2f}/kWh"
        )
        negotiated_price = discounted_price

    # 2. Minimum floor price check
    floor_match = re.search(r"above\s+₹?(\d+(?:\.\d+)?)", lower_rule) or re.search(r">\s*₹?(\d+(?:\.\d+)?)", lower_rule)
    if floor_match:
        floor = float(floor_match.group(1))
        if negotiated_price < floor:
            reasoning.append(
                f"Floor threshold triggered: Raised price to user's defined floor of ₹{floor:.2f}/kWh"
            )
            negotiated_price = floor

    # 3. Zone congestion dynamic delta
    if zone_congestion > 0.60:
        negotiated_price += 0.30
        reasoning.append("High demand in local zone (+₹0.30/kWh congestion premium added)")
    elif zone_congestion < 0.25:
        negotiated_price -= 0.15
        reasoning.append("High solar surplus in zone (-₹0.15/kWh incentive for rapid neighborhood clearance)")

    # 4. Strict bounding within economic viability
    lower_bound = feed_in_rate + 0.50
    upper_bound = grid_tariff - 0.20
    bounded_price = max(lower_bound, min(upper_bound, negotiated_price))
    
    if bounded_price != negotiated_price:
        reasoning.append(
            f"Regulatory safeguard bounded price between floor ₹{lower_bound:.2f} and ceiling ₹{upper_bound:.2f}/kWh"
        )

    final_price = round(bounded_price, 2)
    buyer_savings_percent = round(((grid_tariff - final_price) / grid_tariff) * 100) if grid_tariff > 0 else 0
    seller_surplus_gain_percent = (
        round(((final_price - feed_in_rate) / feed_in_rate) * 100) if feed_in_rate > 0 else 0
    )

    summary = (
        f"Simulated clearing price locked at ₹{final_price:.2f}/kWh — Buyer saves {buyer_savings_percent}% "
        f"vs DISCOM, Seller earns {seller_surplus_gain_percent}% above standard net-metering!"
    )

    return {
        "final_price": final_price,
        "buyer_savings_percent": buyer_savings_percent,
        "seller_surplus_gain_percent": seller_surplus_gain_percent,
        "reasoning": reasoning,
        "summary": summary,
        "is_simulation": True
    }

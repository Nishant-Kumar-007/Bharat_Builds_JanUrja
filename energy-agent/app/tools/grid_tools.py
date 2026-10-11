"""
Deterministic Grid Telemetry and Environmental Impact Calculation Tools.

Calculates:
- CO2 emissions offset (using Central Electricity Authority (CEA) baseline of 0.54 kg/kWh)
- Trees equivalent (assuming 1 mature tree absorbs ~21.77 kg CO2 annually)
- Consumer economic savings vs standard DISCOM peak tariff (₹7.80/kWh)
- DISCOM transit wheeling revenue (₹0.15/kWh transmission surcharge)
"""

from typing import Dict, Any


def calculate_environmental_and_economic_impact_deterministic(
    quantity_kwh: float,
    grid_emission_factor_kg_per_kwh: float = 0.54,
    grid_standard_tariff: float = 7.80,
    purchased_price_per_kwh: float = 6.00,
    wheeling_charge_per_kwh: float = 0.15
) -> Dict[str, Any]:
    """
    Computes exact carbon offset and financial metrics for simulated clean energy dispatch.
    """
    if quantity_kwh <= 0:
        return {
            "quantity_kwh": 0.0,
            "co2_avoided_kg": 0.0,
            "consumer_savings_inr": 0.0,
            "discom_wheeling_fee_inr": 0.0,
            "trees_equivalent": 0.0,
            "summary": "Quantity must be greater than 0 kWh to compute environmental impact.",
            "is_simulation": True
        }

    co2_avoided_kg = round(quantity_kwh * grid_emission_factor_kg_per_kwh, 2)
    # 1 tree absorbs ~21.77 kg CO2 per year
    trees_equivalent = round(co2_avoided_kg / 21.77, 2)
    
    # Financial calculations
    unit_savings = max(0.0, grid_standard_tariff - purchased_price_per_kwh)
    consumer_savings_inr = round(unit_savings * quantity_kwh, 2)
    discom_wheeling_fee_inr = round(quantity_kwh * wheeling_charge_per_kwh, 2)

    summary = (
        f"Simulated transaction of {quantity_kwh:.2f} kWh green power offsets {co2_avoided_kg:.2f} kg CO2 "
        f"(equivalent to {trees_equivalent:.2f} mature trees' annual sequestration), saves ₹{consumer_savings_inr:.2f} "
        f"for consumer vs DISCOM retail rate, and yields ₹{discom_wheeling_fee_inr:.2f} in non-tariff wheeling transit revenue."
    )

    return {
        "quantity_kwh": quantity_kwh,
        "co2_avoided_kg": co2_avoided_kg,
        "consumer_savings_inr": consumer_savings_inr,
        "discom_wheeling_fee_inr": discom_wheeling_fee_inr,
        "trees_equivalent": trees_equivalent,
        "summary": summary,
        "is_simulation": True
    }

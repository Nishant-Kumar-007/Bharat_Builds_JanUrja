"""
Pydantic Schemas for Energy Intelligence Agent.

Defines input/output data contracts for:
- Prosumer pricing rule evaluation
- Consumer multi-attribute offer matching
- Feeder grid constraint validation
- Environmental impact assessment
- Agent conversational endpoints
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


# --- Pricing Models ---

class PricingRuleRequest(BaseModel):
    base_price: float = Field(default=6.20, description="Base baseline price per kWh in INR (e.g. ₹6.20)")
    rule: str = Field(
        default="Auto-price dynamically: Undercut grid tariff by 15% and stay above ₹5.50/unit.",
        description="Natural language pricing constraint/rule formulated by prosumer"
    )
    grid_tariff: float = Field(default=7.80, description="Local DISCOM retail tariff in INR (e.g. ₹7.80)")
    feed_in_rate: float = Field(default=2.90, description="Government net metering feed-in compensation rate in INR")
    zone_congestion: float = Field(default=0.42, ge=0.0, le=1.0, description="Local feeder congestion factor (0.0 - 1.0)")


class PricingRuleResponse(BaseModel):
    final_price: float
    buyer_savings_percent: int
    seller_surplus_gain_percent: int
    reasoning: List[str]
    summary: str
    is_simulation: bool = True


# --- Offer & Matching Models ---

class EnergyOffer(BaseModel):
    id: str
    node_id: Optional[str] = "NODE-DEFAULT"
    seller_id: Optional[str] = "USR-DEFAULT"
    seller_name: str
    node_name: Optional[str] = None
    grid_zone: str = "S1-North"
    price_per_kwh: float = Field(gt=0)
    quantity_kwh: float = Field(gt=0)
    min_quantity_kwh: float = Field(default=0.5, ge=0)
    status: str = "active"
    renewable_percentage: float = Field(default=95.0, ge=0, le=100)
    distance_km: float = Field(default=1.0, ge=0)
    trust_score: Optional[float] = Field(default=95.0, ge=0, le=100)


class MatchingWeights(BaseModel):
    price: float = 0.40
    distance: float = 0.30
    renewable: float = 0.20
    congestion: float = 0.10


class FeederConstraints(BaseModel):
    feeder_capacity_kwh: float = Field(default=100.0, gt=0, description="Max transfer headroom on this 11kV feeder line")
    current_feeder_load_kwh: float = Field(default=30.0, ge=0, description="Existing load on line before new transaction")


class MatchRequest(BaseModel):
    offers: List[EnergyOffer]
    consumer_zone: str = "S2-East"
    requested_kwh: float = Field(default=5.0, gt=0)
    weights: MatchingWeights = Field(default_factory=MatchingWeights)
    feeder_constraints: Optional[FeederConstraints] = Field(default_factory=FeederConstraints)


class ScoredOffer(BaseModel):
    offer: EnergyOffer
    total_score: float
    price_score: float
    distance_score: float
    renewable_score: float
    locality_score: float
    match_reason: str
    is_feasible: bool
    feasibility_reason: str


class MatchResult(BaseModel):
    status: Literal["FEASIBLE", "INFEASIBLE_SUPPLY", "INFEASIBLE_CAPACITY", "INVALID_INPUT"]
    best_match: Optional[ScoredOffer] = None
    ranked_offers: List[ScoredOffer] = Field(default_factory=list)
    requested_kwh: float
    allocated_kwh: float
    unmet_kwh: float
    summary: str
    is_simulation: bool = True


# --- Grid & Environmental Impact Models ---

class ImpactCalculationRequest(BaseModel):
    quantity_kwh: float = Field(gt=0)
    grid_emission_factor_kg_per_kwh: float = Field(default=0.54, ge=0)
    grid_standard_tariff: float = Field(default=7.80, gt=0)
    purchased_price_per_kwh: float = Field(default=6.00, gt=0)
    wheeling_charge_per_kwh: float = Field(default=0.15, ge=0)


class ImpactCalculationResponse(BaseModel):
    quantity_kwh: float
    co2_avoided_kg: float
    consumer_savings_inr: float
    discom_wheeling_fee_inr: float
    trees_equivalent: float
    summary: str
    is_simulation: bool = True


# --- Agent Conversational Endpoints ---

class AgentChatRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None
    requested_kwh: Optional[float] = None
    consumer_zone: Optional[str] = "S2-East"


class AgentChatResponse(BaseModel):
    response: str
    tool_calls_made: List[Dict[str, Any]] = Field(default_factory=list)
    model_provider: str
    is_fallback: bool
    is_simulation: bool = True

"""
FastAPI Server for JanUrja Energy Intelligence.

Provides RESTful endpoints for:
- GET  /api/health: Health check (safe, no secret leakage)
- POST /api/pricing/evaluate: Deterministic prosumer pricing evaluation
- POST /api/matching/find: Deterministic multi-criteria offer matching with feeder constraints
- POST /api/impact/calculate: Deterministic CO2 and savings calculation
- POST /api/agent/chat: Conversational Energy Intelligence agent (Gemini + fallback)
"""

from typing import Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.models import (
    PricingRuleRequest,
    PricingRuleResponse,
    MatchRequest,
    MatchResult,
    ImpactCalculationRequest,
    ImpactCalculationResponse,
    AgentChatRequest,
    AgentChatResponse,
)
from app.tools.pricing_tools import evaluate_pricing_rule_deterministic
from app.tools.matching_tools import match_energy_offers_deterministic
from app.tools.grid_tools import calculate_environmental_and_economic_impact_deterministic
from app.agent import query_energy_intelligence

app = FastAPI(
    title="JanUrja Energy Intelligence Backend",
    version="1.0.0",
    description="Agentic energy matching, dynamic pricing, and feeder intelligence powered by AWS Strands Agents SDK & Gemini"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Max request body size guard (1 MB limit)
MAX_REQUEST_SIZE = 1_000_000


@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_REQUEST_SIZE:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request payload exceeds 1MB limit"}
        )
    return await call_next(request)


# --- Health Endpoint ---

@app.get("/api/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.
    Reports operational status and configured model provider without exposing API keys.
    """
    return {
        "status": "healthy",
        "service": "janurja-energy-agent",
        "model_provider": f"google-gemini/{settings.gemini_model_id}" if settings.has_gemini_key else "deterministic_fallback",
        "has_gemini_key": settings.has_gemini_key,
        "is_simulation": True
    }


# --- Deterministic Pricing Endpoint ---

@app.post("/api/pricing/evaluate", response_model=PricingRuleResponse, tags=["Pricing"])
async def evaluate_pricing(req: PricingRuleRequest) -> PricingRuleResponse:
    """
    Evaluates a prosumer dynamic pricing directive against retail tariff and feeder congestion.
    """
    try:
        res = evaluate_pricing_rule_deterministic(
            base_price=req.base_price,
            rule=req.rule,
            grid_tariff=req.grid_tariff,
            feed_in_rate=req.feed_in_rate,
            zone_congestion=req.zone_congestion
        )
        return PricingRuleResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Pricing evaluation error: {str(e)}")


# --- Deterministic Offer Matching Endpoint ---

@app.post("/api/matching/find", response_model=MatchResult, tags=["Matching"])
async def find_matches(req: MatchRequest) -> MatchResult:
    """
    Evaluates peer solar offers against hard feeder limits and ranks them.
    """
    try:
        raw_offers = [o.model_dump() for o in req.offers]
        feeder_dict = req.feeder_constraints.model_dump() if req.feeder_constraints else None
        weights_dict = req.weights.model_dump() if req.weights else None

        res = match_energy_offers_deterministic(
            offers_raw=raw_offers,
            consumer_zone=req.consumer_zone,
            requested_kwh=req.requested_kwh,
            weights_dict=weights_dict,
            feeder_constraints_dict=feeder_dict
        )
        return MatchResult(**res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Matching evaluation error: {str(e)}")


# --- Deterministic Environmental Impact Endpoint ---

@app.post("/api/impact/calculate", response_model=ImpactCalculationResponse, tags=["Impact"])
async def calculate_impact(req: ImpactCalculationRequest) -> ImpactCalculationResponse:
    """
    Calculates carbon offset (CEA factor 0.54 kg/kWh), tree equivalents, and consumer savings.
    """
    try:
        res = calculate_environmental_and_economic_impact_deterministic(
            quantity_kwh=req.quantity_kwh,
            grid_emission_factor_kg_per_kwh=req.grid_emission_factor_kg_per_kwh,
            grid_standard_tariff=req.grid_standard_tariff,
            purchased_price_per_kwh=req.purchased_price_per_kwh,
            wheeling_charge_per_kwh=req.wheeling_charge_per_kwh
        )
        return ImpactCalculationResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Impact calculation error: {str(e)}")


# --- Conversational Agent Endpoint ---

@app.post("/api/agent/chat", response_model=AgentChatResponse, tags=["Agent"])
async def agent_chat(req: AgentChatRequest) -> AgentChatResponse:
    """
    Conversational Energy Intelligence Agent endpoint.
    Uses Strands Agent with Gemini when configured, or deterministic fallback.
    """
    if not req.query or len(req.query.strip()) == 0:
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")

    try:
        res = query_energy_intelligence(
            query=req.query,
            context=req.context,
            requested_kwh=req.requested_kwh,
            consumer_zone=req.consumer_zone or "S2-East"
        )
        return AgentChatResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")


# --- Grid Events History Endpoint (DynamoDB backed) ---

@app.get("/api/grid/events", tags=["Grid"])
async def get_grid_events(event_type: str = "SCHEDULED_GRID_ANALYSIS", limit: int = 10):
    """
    Retrieves recent timestamped microgrid analysis records from DynamoDB.
    """
    try:
        from app.aws.dynamodb_client import query_recent_grid_events
        items = query_recent_grid_events(event_type=event_type, limit=limit)
        return {
            "event_type": event_type,
            "count": len(items),
            "events": items,
            "is_simulation": True
        }
    except Exception as e:
        return {
            "event_type": event_type,
            "count": 0,
            "events": [],
            "error": str(e),
            "is_simulation": True
        }


# --- AWS Lambda Entrypoint via Mangum ---
try:
    from mangum import Mangum
    handler = Mangum(app, lifespan="off")
except ImportError:
    handler = None


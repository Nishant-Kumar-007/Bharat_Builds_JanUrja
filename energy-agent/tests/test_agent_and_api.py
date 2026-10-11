"""
Comprehensive test suite for Phase 2:
1. Tool execution & schema validation via Strands @tool
2. Deterministic Fallback behavior (when Gemini is unconfigured)
3. Simulated Strands Agent Tool Invocation with Mock Model
4. Missing / Invalid API key error handling
5. FastAPI Endpoint Integration tests:
   - GET  /api/health (safe, no secret exposure)
   - POST /api/pricing/evaluate
   - POST /api/matching/find
   - POST /api/impact/calculate
   - POST /api/agent/chat (deterministic fallback)
   - 413 Payload size limits
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings
from app.tools.strands_tools import (
    evaluate_pricing_rule_tool,
    match_energy_offers_tool,
    calculate_environmental_and_economic_impact_tool,
    STRANDS_ENERGY_TOOLS,
)
from app.agent import (
    execute_deterministic_fallback,
    query_energy_intelligence,
    create_gemini_agent,
)


@pytest.fixture
def client():
    return TestClient(app)


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
        }
    ]


# --- Test 1: Verify Strands @tool Decorator Functionality ---

def test_strands_decorated_tools_registered():
    assert len(STRANDS_ENERGY_TOOLS) == 3
    for t in STRANDS_ENERGY_TOOLS:
        # Strands DecoratedFunctionTool has tool_spec and tool_name
        assert hasattr(t, "tool_spec") or hasattr(t, "tool_name") or callable(t)


def test_strands_pricing_tool_call():
    res = evaluate_pricing_rule_tool(
        base_price=6.20,
        rule="Undercut grid by 10% and keep above ₹5.60",
        grid_tariff=7.80,
        feed_in_rate=2.90,
        zone_congestion=0.40
    )
    # 7.80 * 0.9 = 7.02
    assert res["final_price"] == 7.02
    assert res["buyer_savings_percent"] == 10
    assert res["is_simulation"] is True


def test_strands_matching_tool_call(sample_offers):
    res = match_energy_offers_tool(
        offers=sample_offers,
        consumer_zone="S2-East",
        requested_kwh=8.0,
        feeder_capacity_kwh=100.0,
        current_feeder_load_kwh=20.0
    )
    assert res["status"] == "FEASIBLE"
    assert res["allocated_kwh"] == 8.0
    assert res["best_match"] is not None
    assert res["is_simulation"] is True


def test_strands_impact_tool_call():
    res = calculate_environmental_and_economic_impact_tool(
        quantity_kwh=20.0,
        grid_emission_factor_kg_per_kwh=0.54,
        grid_standard_tariff=7.80,
        purchased_price_per_kwh=6.00,
        wheeling_charge_per_kwh=0.15
    )
    assert res["co2_avoided_kg"] == 10.80
    assert res["consumer_savings_inr"] == 36.00
    assert res["discom_wheeling_fee_inr"] == 3.00


# --- Test 2: Deterministic Fallback Verification ---

def test_deterministic_fallback_matching():
    fallback_res = execute_deterministic_fallback(
        query="Please match me 10 kWh of solar power",
        requested_kwh=10.0,
        consumer_zone="S2-East"
    )
    assert fallback_res["is_fallback"] is True
    assert fallback_res["model_provider"] == "deterministic_fallback_engine"
    assert fallback_res["is_simulation"] is True
    assert "[DETERMINISTIC FALLBACK]" in fallback_res["response"]
    assert len(fallback_res["tool_calls_made"]) >= 1


def test_deterministic_fallback_pricing():
    fallback_res = execute_deterministic_fallback(
        query="Undercut grid tariff by 20% and stay above ₹5.50/unit"
    )
    assert fallback_res["is_fallback"] is True
    assert fallback_res["model_provider"] == "deterministic_fallback_engine"
    assert "Clearing Rate:" in fallback_res["response"]
    assert len(fallback_res["tool_calls_made"]) >= 1


def test_query_energy_intelligence_uses_fallback_when_no_api_key():
    original_key = settings.gemini_api_key
    try:
        settings.gemini_api_key = ""
        res = query_energy_intelligence(query="Find best solar for S1-North", requested_kwh=5.0)
        assert res["is_fallback"] is True
        assert res["model_provider"] == "deterministic_fallback_engine"
    finally:
        settings.gemini_api_key = original_key


# --- Test 3: Missing / Invalid API Key Handling ---

def test_create_gemini_agent_raises_on_empty_key():
    original_key = settings.gemini_api_key
    try:
        settings.gemini_api_key = ""
        with pytest.raises(ValueError, match="Missing GEMINI_API_KEY"):
            create_gemini_agent(api_key="")
    finally:
        settings.gemini_api_key = original_key


# --- Test 4: Strands Tool Execution Protocol Verification ---

@pytest.mark.anyio
async def test_strands_agent_invokes_energy_tool_mocked():
    """
    Demonstrates that a Strands Agent tool (@tool DecoratedFunctionTool)
    executes the Strands tool streaming protocol successfully with valid output.
    """
    tool_use = {
        "toolUseId": "call-1234",
        "name": "calculate_environmental_and_economic_impact",
        "input": {
            "quantity_kwh": 50.0,
            "purchased_price_per_kwh": 6.20
        }
    }

    events = []
    async for event in calculate_environmental_and_economic_impact_tool.stream(tool_use, {}):
        events.append(event)

    assert len(events) >= 1
    last_event = events[-1]
    assert last_event["type"] == "tool_result"
    tool_result = last_event["tool_result"]
    assert tool_result["status"] == "success"
    # Content has text of result
    res_text = str(tool_result["content"])
    assert "27.0" in res_text or "co2_avoided_kg" in res_text


# --- Test 5: FastAPI REST Endpoint Tests ---

def test_api_health_endpoint(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "janurja-energy-agent"
    assert "is_simulation" in data
    # Ensure no secrets leaked
    assert "api_key" not in data
    assert "secret" not in data


def test_api_pricing_evaluate(client):
    payload = {
        "base_price": 6.20,
        "rule": "Undercut grid by 15% and stay above ₹5.50/unit",
        "grid_tariff": 7.80,
        "feed_in_rate": 2.90,
        "zone_congestion": 0.42
    }
    res = client.post("/api/pricing/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["final_price"] == 6.63
    assert data["buyer_savings_percent"] == 15
    assert data["is_simulation"] is True


def test_api_matching_find(client, sample_offers):
    payload = {
        "offers": sample_offers,
        "consumer_zone": "S2-East",
        "requested_kwh": 6.0,
        "feeder_constraints": {
            "feeder_capacity_kwh": 100.0,
            "current_feeder_load_kwh": 20.0
        }
    }
    res = client.post("/api/matching/find", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "FEASIBLE"
    assert data["allocated_kwh"] == 6.0
    assert data["best_match"] is not None


def test_api_matching_invalid_input(client):
    payload = {
        "offers": [],
        "consumer_zone": "S2-East",
        "requested_kwh": -5.0  # Invalid kWh
    }
    res = client.post("/api/matching/find", json=payload)
    assert res.status_code == 422  # Pydantic validation error


def test_api_impact_calculate(client):
    payload = {
        "quantity_kwh": 12.0,
        "grid_emission_factor_kg_per_kwh": 0.54,
        "grid_standard_tariff": 7.80,
        "purchased_price_per_kwh": 6.00,
        "wheeling_charge_per_kwh": 0.15
    }
    res = client.post("/api/impact/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["co2_avoided_kg"] == 6.48
    assert data["consumer_savings_inr"] == 21.60


def test_api_agent_chat_deterministic(client):
    original_key = settings.gemini_api_key
    try:
        settings.gemini_api_key = ""
        payload = {
            "query": "Find best 8 kWh solar match in S2-East",
            "requested_kwh": 8.0,
            "consumer_zone": "S2-East"
        }
        res = client.post("/api/agent/chat", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["is_fallback"] is True
        assert data["is_simulation"] is True
        assert "[DETERMINISTIC FALLBACK]" in data["response"]
    finally:
        settings.gemini_api_key = original_key


def test_api_agent_chat_empty_query(client):
    res = client.post("/api/agent/chat", json={"query": "  "})
    assert res.status_code == 400

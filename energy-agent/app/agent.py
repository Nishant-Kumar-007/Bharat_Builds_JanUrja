"""
Strands Agent orchestration and model provider management.

Supports:
1. Google Gemini Model Provider via `strands.models.gemini.GeminiModel`
   - Configurable model ID (default: gemini-2.5-flash)
   - API key loaded securely via GEMINI_API_KEY / GOOGLE_API_KEY
2. Deterministic Mock / Offline Fallback Provider:
   - Activates when GEMINI_API_KEY is not configured or when the Gemini API is unreachable
   - Clearly labels response provenance: is_fallback=True
   - Directly executes the appropriate deterministic calculation tool and formats structured explanation
"""

import json
import logging
from typing import Dict, Any, List, Optional
from strands import Agent
from strands.models.gemini import GeminiModel

from app.config import settings
from app.tools.strands_tools import (
    STRANDS_ENERGY_TOOLS,
    evaluate_pricing_rule_tool,
    match_energy_offers_tool,
    calculate_environmental_and_economic_impact_tool,
)

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the JanUrja Energy Intelligence Agent, an autonomous grid intelligence assistant for a peer-to-peer solar microgrid in Bengaluru.

CRITICAL INSTRUCTIONS:
1. You MUST call the appropriate energy tools for ANY numerical pricing, offer matching, feeder feasibility, or carbon savings calculation.
2. NEVER invent prices, solar surplus figures, line capacity headroom, or CO2 metrics. The tools are the single authoritative source of truth.
3. When explaining results, cite the exact numbers returned by the tools:
   - For pricing: quote the negotiated clearing price, DISCOM savings %, and floor protections.
   - For matching: explain whether the trade is FEASIBLE or rejected due to feeder line capacity headroom, and cite the selected peer's locality and renewable purity.
   - For environmental impact: cite exact kg CO2 avoided and tree sequestration equivalents.
4. Always clarify that this is an autonomous P2P microgrid energy trading simulation.
"""


def create_gemini_agent(api_key: Optional[str] = None, model_id: Optional[str] = None) -> Agent:
    """
    Initializes a Strands Agent with the Google Gemini model provider and registered energy tools.
    """
    key = api_key or settings.gemini_api_key
    selected_model_id = model_id or settings.gemini_model_id

    if not key:
        raise ValueError("Missing GEMINI_API_KEY. Configure it in .env or pass it explicitly.")

    # Initialize GeminiModel from strands.models.gemini
    gemini_model = GeminiModel(
        model_id=selected_model_id,
        client_args={"api_key": key},
        params={"temperature": settings.model_temperature}
    )

    from strands.handlers import null_callback_handler

    agent = Agent(
        model=gemini_model,
        tools=STRANDS_ENERGY_TOOLS,
        system_prompt=SYSTEM_PROMPT,
        callback_handler=null_callback_handler,
        name="JanUrja-Energy-Intelligence",
        description="Autonomous P2P microgrid matchmaking and dynamic pricing advisor"
    )

    return agent


def execute_deterministic_fallback(
    query: str,
    context: Optional[Dict[str, Any]] = None,
    requested_kwh: Optional[float] = None,
    consumer_zone: str = "S2-East"
) -> Dict[str, Any]:
    """
    Deterministic rule-based fallback when the Google Gemini API is unavailable or unconfigured.
    Clearly returns is_fallback=True, model_provider="deterministic_fallback_engine".
    """
    lower_query = (query or "").lower()
    tool_calls_made = []
    response_text = ""

    # Check for matching intent
    if "match" in lower_query or "find best" in lower_query or "buy" in lower_query or requested_kwh:
        kwh = requested_kwh if (requested_kwh and requested_kwh > 0) else 5.0
        offers = context.get("offers", []) if context else []
        
        # If no offers in context, generate baseline mock prosumer pool
        if not offers:
            offers = [
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

        match_res = match_energy_offers_tool(
            offers=offers,
            consumer_zone=consumer_zone,
            requested_kwh=kwh
        )
        tool_calls_made.append({"tool": "match_energy_offers", "result": match_res})

        if match_res["status"] == "FEASIBLE" and match_res["best_match"]:
            best = match_res["best_match"]
            allocated = match_res["allocated_kwh"]
            price = best["offer"].get("price_per_kwh", 6.0)

            impact_res = calculate_environmental_and_economic_impact_tool(
                quantity_kwh=allocated,
                purchased_price_per_kwh=price
            )
            tool_calls_made.append({"tool": "calculate_environmental_and_economic_impact", "result": impact_res})

            response_text = (
                f"[DETERMINISTIC FALLBACK] Feasible peer energy match found!\n\n"
                f"• Prosumer: {best['offer'].get('seller_name')} in {best['offer'].get('grid_zone')}\n"
                f"• Allocated: {allocated:.2f} kWh @ ₹{price:.2f}/kWh (Score: {best['total_score']}/100)\n"
                f"• Environmental Impact: Offsets {impact_res['co2_avoided_kg']} kg CO2 (~{impact_res['trees_equivalent']} trees)\n"
                f"• Consumer Savings: ₹{impact_res['consumer_savings_inr']} vs standard DISCOM peak tariff.\n\n"
                f"Note: This evaluation was produced by the JanUrja deterministic fallback engine."
            )
        else:
            response_text = (
                f"[DETERMINISTIC FALLBACK] Energy match status: {match_res['status']}.\n\n"
                f"{match_res['summary']}\n\n"
                f"Note: Evaluated by the JanUrja deterministic fallback engine."
            )

    # Check for pricing intent
    elif "price" in lower_query or "tariff" in lower_query or "rule" in lower_query:
        rule_text = query
        base_price = float(context.get("base_price", 6.20)) if context else 6.20
        congestion = float(context.get("zone_congestion", 0.42)) if context else 0.42

        price_res = evaluate_pricing_rule_tool(
            base_price=base_price,
            rule=rule_text,
            zone_congestion=congestion
        )
        tool_calls_made.append({"tool": "evaluate_pricing_rule", "result": price_res})

        response_text = (
            f"[DETERMINISTIC FALLBACK] Evaluated Prosumer Dynamic Pricing Rule:\n\n"
            f"• Clearing Rate: ₹{price_res['final_price']:.2f}/kWh\n"
            f"• Buyer Discount: {price_res['buyer_savings_percent']}% below DISCOM grid rate\n"
            f"• Seller Gain: {price_res['seller_surplus_gain_percent']}% above feed-in tariff\n"
            f"• Rationale: {' | '.join(price_res['reasoning'])}\n\n"
            f"Note: Evaluated by the JanUrja deterministic fallback engine."
        )

    # Default general inquiry
    else:
        response_text = (
            f"[DETERMINISTIC FALLBACK] JanUrja Energy Intelligence is running in deterministic mode.\n\n"
            f"You can request:\n"
            f"1. Energy Matchmaking (e.g., 'Find best 10 kWh solar match in S2-East')\n"
            f"2. Dynamic Prosumer Pricing (e.g., 'Undercut grid by 15% and stay above ₹5.50')\n"
            f"3. Environmental Impact Assessments (e.g., carbon offsets for 25 kWh)\n\n"
            f"Configure GEMINI_API_KEY in .env to enable full Gemini conversational reasoning."
        )

    return {
        "response": response_text,
        "tool_calls_made": tool_calls_made,
        "model_provider": "deterministic_fallback_engine",
        "is_fallback": True,
        "is_simulation": True
    }


def query_energy_intelligence(
    query: str,
    context: Optional[Dict[str, Any]] = None,
    requested_kwh: Optional[float] = None,
    consumer_zone: str = "S2-East"
) -> Dict[str, Any]:
    """
    Main entry point for conversational energy intelligence.
    Attempts Google Gemini agent invocation; falls back cleanly if unconfigured or on error.
    """
    if not settings.has_gemini_key:
        logger.info("GEMINI_API_KEY not configured. Using deterministic fallback.")
        return execute_deterministic_fallback(
            query=query,
            context=context,
            requested_kwh=requested_kwh,
            consumer_zone=consumer_zone
        )

    try:
        agent = create_gemini_agent()
        # Build prompt with context if available
        prompt = query
        if context or requested_kwh or consumer_zone:
            ctx_summary = {
                "consumer_zone": consumer_zone,
                "requested_kwh": requested_kwh,
                "context": context
            }
            prompt = f"User Request: {query}\n\nSession Context: {json.dumps(ctx_summary, default=str)}"

        # Invoke Strands Agent
        result = agent(prompt)
        raw_msg = result.message if hasattr(result, "message") else result
        if isinstance(raw_msg, dict) and "content" in raw_msg and isinstance(raw_msg["content"], list):
            text_parts = [c.get("text", "") for c in raw_msg["content"] if isinstance(c, dict) and "text" in c]
            response_text = "\n".join(text_parts).strip() if text_parts else str(raw_msg)
        else:
            response_text = str(raw_msg)

        return {
            "response": response_text,
            "tool_calls_made": [],  # Autonomous Strands agent tool executions
            "model_provider": f"google-gemini/{settings.gemini_model_id}",
            "is_fallback": False,
            "is_simulation": True
        }

    except Exception as e:
        logger.warning(f"Error invoking Gemini agent: {e}. Falling back to deterministic engine.")
        fallback = execute_deterministic_fallback(
            query=query,
            context=context,
            requested_kwh=requested_kwh,
            consumer_zone=consumer_zone
        )
        fallback["error_details"] = str(e)
        return fallback

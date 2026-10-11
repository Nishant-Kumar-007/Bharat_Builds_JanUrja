"""
Scheduled periodic grid analysis task intended for AWS EventBridge execution.

Features:
- Bounded periodic analysis of microgrid zones.
- Uses pure deterministic calculations for zone aggregation (NO LLM calls by default to keep cost zero).
- Automatically persists snapshots to DynamoDB.
- Triggers SNS alerts ONLY on severe feeder line constraints with deduplication.
"""

import os
import logging
from typing import Dict, Any, List, Optional
from app.aws.dynamodb_client import persist_grid_event
from app.aws.sns_client import publish_grid_congestion_alert

logger = logging.getLogger(__name__)

# Bengaluru microgrid zone models for periodic analysis
DEFAULT_ZONES_TELEMETRY = [
    {"code": "S1-North", "name": "Hebbal Microgrid Feeder", "feeder_capacity_kwh": 50.0, "current_load_kwh": 18.2, "solar_surplus_kwh": 14.5},
    {"code": "S2-East", "name": "Indiranagar Feeder", "feeder_capacity_kwh": 60.0, "current_load_kwh": 35.0, "solar_surplus_kwh": 22.0},
    {"code": "S3-South", "name": "Koramangala Feeder", "feeder_capacity_kwh": 40.0, "current_load_kwh": 36.5, "solar_surplus_kwh": 3.8},
    {"code": "S4-West", "name": "Malleshwaram Feeder", "feeder_capacity_kwh": 45.0, "current_load_kwh": 15.0, "solar_surplus_kwh": 14.4},
    {"code": "Central-Hub", "name": "BESCOM Central Node", "feeder_capacity_kwh": 100.0, "current_load_kwh": 45.0, "solar_surplus_kwh": 42.0},
]


def run_periodic_grid_analysis(event: Optional[Dict[str, Any]] = None, context: Any = None) -> Dict[str, Any]:
    """
    Handler executed on EventBridge schedule (e.g. rate(6 hours) or manual trigger).
    """
    logger.info("Starting scheduled periodic grid-analysis task...")
    results = []

    for zone in DEFAULT_ZONES_TELEMETRY:
        capacity = float(zone["feeder_capacity_kwh"])
        load = float(zone["current_load_kwh"])
        surplus = float(zone["solar_surplus_kwh"])
        headroom = max(0.0, capacity - load)
        congestion_ratio = round(load / capacity, 2) if capacity > 0 else 1.0

        status = "NORMAL"
        if congestion_ratio >= 0.85:
            status = "CRITICAL_CONGESTION"
        elif congestion_ratio >= 0.60:
            status = "ELEVATED_LOAD"

        metrics = {
            "capacity_kwh": capacity,
            "load_kwh": load,
            "surplus_kwh": surplus,
            "headroom_kwh": headroom,
            "congestion_ratio": congestion_ratio
        }

        summary = (
            f"Zone {zone['code']} ({zone['name']}): Load {load}/{capacity} kWh ({int(congestion_ratio*100)}%), "
            f"Headroom {headroom:.1f} kWh, Surplus {surplus:.1f} kWh. Status: {status}."
        )

        # 1. Persist to DynamoDB
        persisted = persist_grid_event(
            event_type="SCHEDULED_GRID_ANALYSIS",
            zone_code=zone["code"],
            status=status,
            metrics=metrics,
            summary=summary
        )

        # 2. Check if SNS alert is justified (automatically checks >= 0.85 and cooldown)
        alert_res = publish_grid_congestion_alert(
            zone_code=zone["code"],
            congestion_ratio=congestion_ratio,
            headroom_kwh=headroom
        )

        results.append({
            "zone": zone["code"],
            "status": status,
            "metrics": metrics,
            "alert_published": alert_res.get("published", False)
        })

    logger.info(f"Periodic grid-analysis completed. Analyzed {len(results)} zones.")
    return {
        "status": "COMPLETED",
        "zones_analyzed": len(results),
        "details": results,
        "is_simulation": True
    }

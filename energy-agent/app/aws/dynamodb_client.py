"""
AWS DynamoDB integration for persisting timestamped grid-intelligence analysis results,
recommendation history, and feeder congestion events.

Table Schema:
- Table Name: JanUrjaGridEvents (or configurable via GRID_EVENTS_TABLE_NAME)
- Partition Key: event_type (String, e.g. 'GRID_ANALYSIS', 'CONGESTION_ALERT', 'MATCH_RECOMMENDATION')
- Sort Key: timestamp (String, ISO 8601 UTC, e.g. '2026-10-11T01:50:00.000Z')
- Attributes:
    - event_id (String, UUID)
    - zone_code (String)
    - status (String, 'FEASIBLE', 'CONGESTED', 'WARNING')
    - metrics (Map/Dict)
    - summary (String)
    - is_simulation (Boolean, True)
    - expiration_ttl (Number, epoch seconds for automated cleanup)
"""

import os
import uuid
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def get_dynamodb_table():
    table_name = os.getenv("GRID_EVENTS_TABLE_NAME", "JanUrjaGridEvents")
    region = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "ap-south-1"))
    dynamodb = boto3.resource("dynamodb", region_name=region)
    return dynamodb.Table(table_name)


def persist_grid_event(
    event_type: str,
    zone_code: str,
    status: str,
    metrics: Dict[str, Any],
    summary: str,
    ttl_days: int = 30
) -> Dict[str, Any]:
    """
    Persists a timestamped microgrid analysis result into DynamoDB.
    Uses a collision-free compound sort key (ISO8601 timestamp + UUID suffix)
    and an attribute_not_exists conditional check to guarantee that events
    are never accidentally overwritten.
    """
    event_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    sort_key = f"{now_iso}#{event_id[:8]}"
    ttl_epoch = int(time.time()) + (ttl_days * 86400)

    # Cast floats to strings or Decimal-friendly representations for DynamoDB
    safe_metrics = {}
    for k, v in metrics.items():
        if isinstance(v, float):
            safe_metrics[k] = str(round(v, 4))
        else:
            safe_metrics[k] = v

    item = {
        "event_type": event_type,
        "timestamp": sort_key,
        "raw_timestamp": now_iso,
        "event_id": event_id,
        "zone_code": zone_code,
        "status": status,
        "metrics": safe_metrics,
        "summary": summary,
        "is_simulation": True,
        "expiration_ttl": ttl_epoch
    }

    try:
        table = get_dynamodb_table()
        # Conditional write: ensures the record does not overwrite an existing record
        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(event_type) AND attribute_not_exists(#ts)",
            ExpressionAttributeNames={"#ts": "timestamp"}
        )
        logger.info(f"Persisted event {event_id} ({event_type}) to DynamoDB with condition check")
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "")
        if error_code == "ConditionalCheckFailedException":
            logger.warning(f"DynamoDB conditional write prevented duplicate overwrite for event {event_id}")
        else:
            logger.warning(f"DynamoDB persistence bypassed: {error_code}")
    except Exception as e:
        logger.warning(f"DynamoDB write skipped: {e}")

    return item


def query_recent_grid_events(
    event_type: str,
    limit: int = 20
) -> List[Dict[str, Any]]:
    """
    Queries recent grid analysis events for a given event_type partition key.
    """
    try:
        table = get_dynamodb_table()
        response = table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key("event_type").eq(event_type),
            ScanIndexForward=False,  # Descending by timestamp
            Limit=limit
        )
        return response.get("Items", [])
    except ClientError as e:
        logger.warning(f"DynamoDB query failed: {e.response['Error']['Code']}")
        return []
    except Exception as e:
        logger.warning(f"DynamoDB query error: {e}")
        return []

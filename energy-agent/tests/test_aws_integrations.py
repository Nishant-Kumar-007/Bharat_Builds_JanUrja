"""
Tests for Phase 3 AWS service integrations:
1. SSM Parameter Store retrieval of Gemini API Key
2. DynamoDB persistence and query of grid events (with TTL and Decimal safety)
3. SNS congestion alert publication with threshold gating and cooldown deduplication
4. EventBridge scheduled periodic analysis execution
5. AWS Lambda invocation via Mangum adapter
"""

import os
import pytest
import boto3
from moto import mock_aws

from app.aws.ssm_client import get_gemini_api_key_secure
from app.aws.dynamodb_client import persist_grid_event, query_recent_grid_events
from app.aws.sns_client import publish_grid_congestion_alert, _ALERT_COOLDOWN_CACHE
from app.aws.eventbridge_handler import run_periodic_grid_analysis
from app.main import handler


@pytest.fixture(autouse=True)
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "ap-south-1"
    os.environ["AWS_REGION"] = "ap-south-1"


# --- Test 1: SSM Parameter Store Integration ---

@mock_aws
def test_ssm_parameter_store_retrieval(monkeypatch):
    from app.aws.ssm_client import clear_gemini_key_cache
    clear_gemini_key_cache()

    monkeypatch.setenv("GEMINI_API_KEY", "")
    monkeypatch.setenv("GOOGLE_API_KEY", "")

    ssm = boto3.client("ssm", region_name="ap-south-1")
    ssm.put_parameter(
        Name="/janurja/gemini_api_key",
        Value="mocked_ssm_secret_key_12345",
        Type="SecureString"
    )

    # First fetch from SSM
    key = get_gemini_api_key_secure(parameter_name="/janurja/gemini_api_key")
    assert key == "mocked_ssm_secret_key_12345"

    # Second fetch should hit in-memory cache even if parameter is deleted
    ssm.delete_parameter(Name="/janurja/gemini_api_key")
    cached_key = get_gemini_api_key_secure(parameter_name="/janurja/gemini_api_key")
    assert cached_key == "mocked_ssm_secret_key_12345"
    clear_gemini_key_cache()


# --- Test 2: DynamoDB Event Persistence & Query ---

@mock_aws
def test_dynamodb_persistence_and_query():
    table_name = "JanUrjaGridEvents"
    os.environ["GRID_EVENTS_TABLE_NAME"] = table_name

    dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
    # Create mock table matching SAM schema
    dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "event_type", "KeyType": "HASH"},
            {"AttributeName": "timestamp", "KeyType": "RANGE"}
        ],
        AttributeDefinitions=[
            {"AttributeName": "event_type", "AttributeType": "S"},
            {"AttributeName": "timestamp", "AttributeType": "S"}
        ],
        BillingMode="PAY_PER_REQUEST"
    )

    # Persist an event
    item = persist_grid_event(
        event_type="SCHEDULED_GRID_ANALYSIS",
        zone_code="S2-East",
        status="NORMAL",
        metrics={"capacity_kwh": 60.0, "load_kwh": 35.0, "congestion_ratio": 0.58},
        summary="S2-East normal operating conditions"
    )

    assert item["event_type"] == "SCHEDULED_GRID_ANALYSIS"
    assert item["status"] == "NORMAL"
    assert "event_id" in item
    assert "expiration_ttl" in item
    assert "raw_timestamp" in item
    assert "#" in item["timestamp"]

    # Query recent events
    results = query_recent_grid_events(event_type="SCHEDULED_GRID_ANALYSIS", limit=5)
    assert len(results) == 1
    assert results[0]["zone_code"] == "S2-East"
    assert results[0]["is_simulation"] is True


# --- Test 3: SNS Alert Publication & Cooldown Deduplication ---

@mock_aws
def test_sns_alert_publication_and_cooldown():
    _ALERT_COOLDOWN_CACHE.clear()

    sns = boto3.client("sns", region_name="ap-south-1")
    topic_res = sns.create_topic(Name="JanUrjaGridAlerts")
    topic_arn = topic_res["TopicArn"]

    # 1. Normal conditions: should NOT publish
    res_normal = publish_grid_congestion_alert(
        zone_code="S1-North",
        congestion_ratio=0.50,
        headroom_kwh=25.0,
        topic_arn=topic_arn
    )
    assert res_normal["published"] is False
    assert "normal" in res_normal["reason"].lower()

    # 2. Critical congestion condition: should publish
    res_critical = publish_grid_congestion_alert(
        zone_code="S3-South",
        congestion_ratio=0.92,
        headroom_kwh=3.2,
        topic_arn=topic_arn
    )
    assert res_critical["published"] is True
    assert "message_id" in res_critical

    # 3. Repeat call immediately: should be suppressed by cooldown deduplication
    res_repeat = publish_grid_congestion_alert(
        zone_code="S3-South",
        congestion_ratio=0.95,
        headroom_kwh=2.0,
        topic_arn=topic_arn
    )
    assert res_repeat["published"] is False
    assert "cooldown active" in res_repeat["reason"].lower()


# --- Test 4: EventBridge Scheduled Analysis Task ---

@mock_aws
def test_eventbridge_scheduled_analysis():
    table_name = "JanUrjaGridEvents"
    os.environ["GRID_EVENTS_TABLE_NAME"] = table_name

    dynamodb = boto3.resource("dynamodb", region_name="ap-south-1")
    dynamodb.create_table(
        TableName=table_name,
        KeySchema=[
            {"AttributeName": "event_type", "KeyType": "HASH"},
            {"AttributeName": "timestamp", "KeyType": "RANGE"}
        ],
        AttributeDefinitions=[
            {"AttributeName": "event_type", "AttributeType": "S"},
            {"AttributeName": "timestamp", "AttributeType": "S"}
        ],
        BillingMode="PAY_PER_REQUEST"
    )

    res = run_periodic_grid_analysis()
    assert res["status"] == "COMPLETED"
    assert res["zones_analyzed"] == 5
    assert res["is_simulation"] is True

    # Verify persisted in DynamoDB
    items = query_recent_grid_events("SCHEDULED_GRID_ANALYSIS", limit=10)
    assert len(items) == 5


# --- Test 5: Lambda Mangum Handler Verification ---

def test_lambda_mangum_handler_execution():
    assert handler is not None

    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    # Construct mock API Gateway HTTP API v2 event
    event = {
        "version": "2.0",
        "routeKey": "GET /api/health",
        "rawPath": "/api/health",
        "rawQueryString": "",
        "headers": {
            "accept": "application/json",
            "host": "api.janurja.local"
        },
        "requestContext": {
            "http": {
                "method": "GET",
                "path": "/api/health",
                "protocol": "HTTP/1.1",
                "sourceIp": "127.0.0.1",
                "userAgent": "pytest-client"
            }
        },
        "isBase64Encoded": False
    }

    response = handler(event, {})
    assert response["statusCode"] == 200
    assert "healthy" in response["body"]

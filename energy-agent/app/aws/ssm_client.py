"""
AWS Systems Manager (SSM) Parameter Store integration for secure key management.

Loads GEMINI_API_KEY from SSM Parameter Store (/janurja/gemini_api_key) when deployed on AWS,
with local environment variable fallback for development and testing.
Never logs or prints parameter values.
"""

import os
import logging
from typing import Optional
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

# In-memory cache for decrypted API key to avoid repeated SSM/KMS network calls across Lambda invocations
_CACHED_GEMINI_API_KEY: Optional[str] = None


def clear_gemini_key_cache():
    """Clears the in-memory cached key (useful for tests or key rotation)."""
    global _CACHED_GEMINI_API_KEY
    _CACHED_GEMINI_API_KEY = None


def get_gemini_api_key_secure(parameter_name: str = "/janurja/gemini_api_key") -> str:
    """
    Retrieves the Gemini API key.
    
    Order of precedence:
    1. In-memory cached key (if already fetched in current container lifecycle)
    2. Local environment variable `GEMINI_API_KEY` (if set)
    3. Local environment variable `GOOGLE_API_KEY` (if set)
    4. AWS SSM Parameter Store SecureString parameter (when running in AWS / Lambda)
    
    Returns:
        The API key string or empty string if not found.
    """
    global _CACHED_GEMINI_API_KEY
    if _CACHED_GEMINI_API_KEY is not None and len(_CACHED_GEMINI_API_KEY) > 5:
        return _CACHED_GEMINI_API_KEY

    # 1. Environment variable check
    env_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if env_key and len(env_key.strip()) > 5:
        _CACHED_GEMINI_API_KEY = env_key.strip()
        return _CACHED_GEMINI_API_KEY

    # 2. Check if running in AWS or explicitly configured to use SSM
    param_override = os.getenv("SSM_GEMINI_KEY_PARAM", parameter_name)
    try:
        region = os.getenv("AWS_REGION", os.getenv("AWS_DEFAULT_REGION", "ap-south-1"))
        ssm = boto3.client("ssm", region_name=region)
        response = ssm.get_parameter(Name=param_override, WithDecryption=True)
        val = response.get("Parameter", {}).get("Value", "").strip()
        if val:
            logger.info("Successfully loaded Gemini API key from AWS SSM Parameter Store (cached in memory)")
            _CACHED_GEMINI_API_KEY = val
            return val
    except ClientError as e:
        logger.warning(f"Unable to read SSM parameter '{param_override}': {e.response['Error']['Code']}")
    except Exception as e:
        logger.warning(f"SSM parameter retrieval bypassed: {e}")

    return ""

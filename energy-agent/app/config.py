"""
Configuration manager for Energy Intelligence backend.

Securely loads environment variables without printing or exposing secrets.
"""

import os
from typing import List
from dotenv import load_dotenv

# Load .env if present in current directory or energy-agent directory
load_dotenv()


class Settings:
    def __init__(self):
        self._gemini_api_key_override = None
        self._gemini_model_id_override = None

    @property
    def gemini_api_key(self) -> str:
        if self._gemini_api_key_override is not None:
            return self._gemini_api_key_override
        key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
        if key.strip() and len(key.strip()) > 5:
            return key.strip()
        # Fallback to AWS SSM Parameter Store if running on AWS
        try:
            from app.aws.ssm_client import get_gemini_api_key_secure
            return get_gemini_api_key_secure()
        except Exception:
            return ""

    @gemini_api_key.setter
    def gemini_api_key(self, value: str):
        self._gemini_api_key_override = value
        try:
            from app.aws.ssm_client import clear_gemini_key_cache
            clear_gemini_key_cache()
        except Exception:
            pass

    @property
    def gemini_model_id(self) -> str:
        if self._gemini_model_id_override is not None:
            return self._gemini_model_id_override
        return os.getenv("GEMINI_MODEL_ID", "gemini-3.8-flash").strip()

    @gemini_model_id.setter
    def gemini_model_id(self, value: str):
        self._gemini_model_id_override = value

    @property
    def model_temperature(self) -> float:
        try:
            return float(os.getenv("MODEL_TEMPERATURE", "0.2"))
        except ValueError:
            return 0.2

    @property
    def host(self) -> str:
        return os.getenv("HOST", "0.0.0.0")

    @property
    def port(self) -> int:
        try:
            return int(os.getenv("PORT", "8000"))
        except ValueError:
            return 8000

    @property
    def cors_origins(self) -> List[str]:
        raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
        return [o.strip() for o in raw.split(",") if o.strip()]

    @property
    def has_gemini_key(self) -> bool:
        return bool(self.gemini_api_key and len(self.gemini_api_key) > 5)


settings = Settings()

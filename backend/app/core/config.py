"""Stash Backend — Core Configuration"""
import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Stash"
    DEBUG: bool = False
    BACKEND_URL: str = ""
    RENDER_EXTERNAL_URL: str = ""
    CLOUD_RUN_SERVICE_URL: str = ""
    FRONTEND_URL: str = ""
    CORS_ORIGINS: str = ""
    ENABLE_ML_WARMUP: bool = False
    ENABLE_SCHEDULER: bool = False
    ENABLE_TELEGRAM_WEBHOOK: bool = False

    # Database
    REDIS_URL: str = "redis://localhost:6379/0"

    # Google AI
    GOOGLE_AI_API_KEY: str = ""
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GOOGLE_APPLICATION_CREDENTIALS_JSON: str = ""
    GEMINI_MODEL: str = "gemini-flash-latest"
    FIRESTORE_DATABASE: str = "stash"
    BIGQUERY_DATASET: str = "stash_analytics"
    FIREBASE_STORAGE_BUCKET: str = ""
    GOOGLE_MAPS_API_KEY: str = ""
    GOOGLE_TRANSLATE_API_KEY: str = ""

    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_SECRET: str = ""
    TELEGRAM_CHAT_ID: str = ""
    TELEGRAM_WEBHOOK_URL: str = ""

    # Auth
    SECRET_KEY: str = "stash-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # IMD Weather
    IMD_API_BASE_URL: str = "https://api.imd.gov.in"

    # Additional keys from shared .env
    NEXTAUTH_SECRET: str = ""
    NEXTAUTH_URL: str = ""
    NEXT_PUBLIC_API_URL: str = ""
    ELEVENLABS_API_KEY: str = ""
    GCP_REGION: str = "us-central1"

    @property
    def effective_backend_url(self) -> str:
        """Resolve the public backend URL for webhook and callback generation."""
        return (
            self.TELEGRAM_WEBHOOK_URL
            or self.BACKEND_URL
            or self.CLOUD_RUN_SERVICE_URL
            or self.RENDER_EXTERNAL_URL
            or ""
        ).rstrip("/")

    @property
    def effective_cors_origins(self) -> list[str]:
        """Build CORS origins from defaults and environment overrides."""
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://stash-app.web.app",
        ]

        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL.rstrip("/"))

        if self.CORS_ORIGINS:
            for origin in self.CORS_ORIGINS.split(","):
                candidate = origin.strip().rstrip("/")
                if candidate:
                    origins.append(candidate)

        seen = set()
        deduped = []
        for origin in origins:
            if origin not in seen:
                seen.add(origin)
                deduped.append(origin)
        return deduped


    model_config = {
        "env_file": (".env", "../.env"),
        "case_sensitive": True,
        "extra": "ignore"
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

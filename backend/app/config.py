from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # MongoDB (Required real connection per user instruction)
    MONGODB_URI: Optional[str] = None
    DB_NAME: str = "velvet_invite"

    # Auth & Security
    JWT_SECRET: str = "development_jwt_secret_key_velvet_invite_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # AI Provider (Anthropic Claude default per TRD §2.4)
    AI_PROVIDER: str = "anthropic"
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-7-sonnet-latest"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4o"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None


@lru_cache
def get_settings() -> Settings:
    return Settings()

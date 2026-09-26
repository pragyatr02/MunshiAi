from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory (points to backend/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application configuration loaded from environment or backend/.env file."""

    PROJECT_NAME: str = "MunshiAI"

    # PostgreSQL connection settings
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 5432
    DB_NAME: str = "munshi_ai"

    # Full SQLAlchemy connection URL (uses psycopg2 driver by default)
    DATABASE_URL: str = "postgresql://postgres:postgres@127.0.0.1:5432/munshi_ai"

    OPENAI_API_KEY: str
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

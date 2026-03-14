from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "StockVerse API"
    api_prefix: str = "/api/v1"
    app_env: str = Field(default="dev")

    database_url: str | None = None
    dev_database_url: str = "sqlite+aiosqlite:///./stockverse.db"
    prod_database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/stockverse"

    secret_key: str = "change_me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    otp_request_limit: int = 5
    otp_window_seconds: int = 900

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url

        if self.app_env.lower() == "prod":
            return self.prod_database_url

        return self.dev_database_url


settings = Settings()

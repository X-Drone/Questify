from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Debug mode - set to true to enable verbose logging, sqlite db autousage and other debug features
    debug: bool = False

    # The URL of the authentication service. This is used to verify JWT tokens and fetch user information
    auth_url: str = "http://localhost:3003/auth/"
    
    # Database configuration. The server will connect to a PostgreSQL database using these credentials
    database_user: str = "postgres"
    database_password: str = "postgres"
    database_db: str = "questify"
    # You can also use the DATABASE_URL variable to specify the connection string directly, this will override the individual variables above if set
    database_url: str = f"postgresql://{database_user}:{database_password}@localhost:5432/{database_db}"
    # Connection pool settings - optional, adjust based on your workload and database performance
    database_pool_size: int = 5
    database_pool_timeout: int = 30


    @model_validator(mode="after")
    def assemble_url(self):
        if self.debug:
            self.database_url = (
                "sqlite:///./dev.db"
                # "sqlite+aiosqlite:///./dev.db"
            )
        return self


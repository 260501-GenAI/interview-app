"""Configuration settings using Pydantic BaseSettings."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Keys
    openai_api_key: str
    
    # Interview Settings
    max_follow_ups: int = 1
    
    # ChromaDB
    chroma_persist_dir: str = "./chroma_db"
    
    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    
    # App Info
    app_name: str = "Interview Preparedness API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

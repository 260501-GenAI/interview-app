"""Configuration settings using Pydantic BaseSettings."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # ── Model Provider (Swappable Pattern) ──
    # ── Model Provider (Swappable Pattern) ──
    # Set to "openai" or "vertex" to switch all models at once
    llm_provider: str = "openai"
    
    # API Keys (required for OpenAI provider)
    openai_api_key: str = ""
    
    # Interview Settings
    max_follow_ups: int = 1
    
    # GCP Settings (required for Vertex AI provider)
    gcp_project_id: str = ""
    gcp_location: str = "us-central1"
    # Optional: JSON credentials content (alternative to file mount)
    google_credentials_json: str = ""
    
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
    
    def setup_gcp_auth(self):
        """Handle GCP authentication from JSON string env var."""
        if self.google_credentials_json:
            import json
            import os
            import tempfile
            
            try:
                # Parse to validate JSON
                creds = json.loads(self.google_credentials_json)
                
                # Create a temporary file
                # Use a specific prefix so we can identify it
                with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False, prefix='gcp_creds_') as f:
                    json.dump(creds, f)
                    tmp_path = f.name
                
                # Set env var for Google libraries
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = tmp_path
                print(f"Set GOOGLE_APPLICATION_CREDENTIALS to temporary file: {tmp_path}")
                
            except Exception as e:
                print(f"Failed to process GOOGLE_CREDENTIALS_JSON: {e}")
                # Don't raise, let default auth try to find other credentials (unlikely to work, but safer)
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

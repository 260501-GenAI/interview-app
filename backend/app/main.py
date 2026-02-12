"""Interview Preparedness API - Main Application."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.config import get_settings
from app.api.routes import interview, materials

load_dotenv()  # Load .env into os.environ before any LangChain imports

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    # Startup
    settings = get_settings()
    
    # Initialize GCP Auth (if env var set)
    settings.setup_gcp_auth()
    
    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Model Provider: {settings.llm_provider}")
    
    # Debug: Check Vertex AI dependencies if configured
    if settings.llm_provider == "vertex":
        try:
            import langchain_google_genai
            print(f"Vertex AI Check: langchain_google_genai imported successfully.")
        except ImportError as e:
            print(f"Vertex AI Check FAILED: Could not import langchain_google_genai. Error: {e}")
        except Exception as e:
            print(f"Vertex AI Check FAILED: Unexpected error importing langchain_google_genai. Error: {e}")

    yield
    # Shutdown
    print("Shutting down...")


def create_app() -> FastAPI:
    """Application factory."""
    settings = get_settings()
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Multi-agent interview preparation engine with voice recording and intelligent assessment.",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include routers
    app.include_router(interview.router, prefix="/api/v1")
    app.include_router(materials.router, prefix="/api/v1")
    
    @app.get("/health", tags=["health"])
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy", "version": settings.app_version}
    
    return app


app = create_app()

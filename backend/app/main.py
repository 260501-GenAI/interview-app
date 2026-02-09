"""Interview Preparedness API - Main Application."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.routes import interview, materials


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    # Startup
    settings = get_settings()
    print(f"Starting {settings.app_name} v{settings.app_version}")
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

"""Dependency injection for API routes."""
from functools import lru_cache
from typing import Annotated
from fastapi import Depends

from app.config import Settings, get_settings
from app.services.vectorstore import VectorStoreService


# Settings dependency
SettingsDep = Annotated[Settings, Depends(get_settings)]


# Vector store service (singleton)
@lru_cache
def get_vectorstore_service() -> VectorStoreService:
    """Get cached vector store service instance."""
    settings = get_settings()
    return VectorStoreService(persist_dir=settings.chroma_persist_dir)


VectorStoreDep = Annotated[VectorStoreService, Depends(get_vectorstore_service)]


# Session store for active interviews (in-memory for demo)
_interview_sessions: dict[str, dict] = {}


def get_session_store() -> dict[str, dict]:
    """Get the interview session store."""
    return _interview_sessions


SessionStoreDep = Annotated[dict[str, dict], Depends(get_session_store)]

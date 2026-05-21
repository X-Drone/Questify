"""
API module
"""
from fastapi import APIRouter
from .tests import router as tests_router
from .questions import router as questions_router
from .attempts import router as attempts_router
from core import settings
from infra.persist import db

router = APIRouter()

# Include all sub-routers
router.include_router(tests_router)
router.include_router(questions_router)
router.include_router(attempts_router)


@router.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "ok",
            "debug": settings.debug,
            "db": db.engine.url if hasattr(db.engine, 'url') else str(db.engine)}

__all__ = ["router"]

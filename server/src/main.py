# FastAPI application entry point
import sys
import os

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import Settings
from infra.persist.db import db
from infra.persist.base import Base
from infra.web.api import router

settings = Settings()
app = FastAPI(debug=settings.debug, title="Questify API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup (only for development with SQLite)
# For production, use Alembic migrations
if settings.debug:
    Base.metadata.create_all(bind=db.engine)

# Include API routes
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    try:
        db.wait_for_db()
        print("Database connection successful")
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    db.close()


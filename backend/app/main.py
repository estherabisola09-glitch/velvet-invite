from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection, check_mongo_health
from app.services.ai_builder import get_ai_builder_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("velvet_invite")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("Starting up Velvet Invite API...")
    await connect_to_mongo()
    yield
    logger.info("Shutting down Velvet Invite API...")
    await close_mongo_connection()


settings = get_settings()

app = FastAPI(
    title="Velvet Invite API",
    description="Backend API for Velvet Invite - AI-Powered Wedding Website Builder",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "Velvet Invite API",
        "version": "0.1.0",
        "docs_url": "/docs",
        "health_url": "/health",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend, database, and external service readiness."""
    db_health = await check_mongo_health()
    ai_service = get_ai_builder_service()
    ai_health = await ai_service.check_health()

    return {
        "status": "ok",
        "app": "Velvet Invite API",
        "version": "0.1.0",
        "database": db_health,
        "ai_service": ai_health,
    }

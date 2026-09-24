import logging
# FIX: Point to the actual user.py location inside app/models/
from app.models.user import User
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import beanie

from app.config import get_settings

logger = logging.getLogger(__name__)

client: Optional[AsyncIOMotorClient] = None

async def connect_to_mongo() -> dict:
    """Connect to MongoDB using Motor and initialize Beanie ODM."""
    global client
    settings = get_settings()

    if not settings.MONGODB_URI or not settings.MONGODB_URI.strip():
        logger.warning(
            "MONGODB_URI is not set in .env. Waiting for MongoDB Atlas connection string."
        )
        return {
            "status": "pending_configuration",
            "message": "MONGODB_URI is empty in .env. Please configure your Atlas connection string.",
        }

    try:
        logger.info("Connecting to MongoDB at configured MONGODB_URI...")
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )
        # Verify connection
        await client.admin.command("ping")
        db = client[settings.DB_NAME]

        # Register Beanie document models
        document_models = [User]
        if document_models:
            await beanie.init_beanie(database=db, document_models=document_models)

        logger.info("Successfully connected to MongoDB (%s).", settings.DB_NAME)
        return {"status": "connected", "database": settings.DB_NAME}
    except Exception as exc:
        logger.error("Failed to connect to MongoDB: %s", exc)
        return {"status": "connection_error", "error": str(exc)}

async def close_mongo_connection() -> None:
    """Close MongoDB connection pool."""
    global client
    if client is not None:
        client.close()
        logger.info("Closed MongoDB connection.")
        client = None

async def check_mongo_health() -> dict:
    """Check MongoDB live health status."""
    global client
    settings = get_settings()
    if not settings.MONGODB_URI or not settings.MONGODB_URI.strip():
        return {
            "configured": False,
            "status": "pending_configuration",
            "message": "Awaiting MONGODB_URI in .env",
        }
    if client is None:
        return {"configured": True, "status": "disconnected"}
    try:
        await client.admin.command("ping")
        return {"configured": True, "status": "connected", "database": settings.DB_NAME}
    except Exception as exc:
        return {"configured": True, "status": "unreachable", "error": str(exc)}

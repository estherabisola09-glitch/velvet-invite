import logging
import beanie
from pymongo import AsyncMongoClient

from app.config import get_settings
from app.models.user import User

logger = logging.getLogger(__name__)

client: AsyncMongoClient | None = None

async def connect_to_mongo() -> dict:
    """Connect to MongoDB using PyMongo Async and initialize Beanie ODM."""
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

    mongo_client: AsyncMongoClient | None = None
    try:
        logger.info("Connecting to MongoDB at configured MONGODB_URI...")
        mongo_client = AsyncMongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )
        # Verify connection
        await mongo_client.admin.command("ping")
        db = mongo_client[settings.DB_NAME]

        # Register Beanie document models
        document_models = [User]
        if document_models:
            await beanie.init_beanie(database=db, document_models=document_models)

        client = mongo_client
        logger.info("Successfully connected to MongoDB (%s).", settings.DB_NAME)
        return {"status": "connected", "database": settings.DB_NAME}
    except Exception as exc:
        if mongo_client is not None:
            await mongo_client.close()
        logger.error("Failed to connect to MongoDB: %s", exc)
        return {"status": "connection_error", "error": str(exc)}

async def close_mongo_connection() -> None:
    """Close MongoDB connection pool."""
    global client
    if client is not None:
        await client.close()
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

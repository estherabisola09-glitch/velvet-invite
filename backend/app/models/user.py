from beanie import Document
from pydantic import EmailStr
from datetime import datetime
from enum import Enum

class PlanType(str, Enum):
    free = "free"
    paid = "paid"

class User(Document):
    name: str
    email: EmailStr
    password_hash: str
    plan: PlanType = PlanType.free
    edits_used: int = 0
    edits_limit: int = 5
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"

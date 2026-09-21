"""AI Builder Service Abstraction Layer.

Defines a generic interface (AIBuilderBaseService) and an Anthropic Claude
implementation (AnthropicAIBuilderService) matching TRD §2.1–2.4.
Allows easily swapping or augmenting LLM providers without altering core application logic.
"""

from abc import ABC, abstractmethod
import logging
from typing import Any, Dict, Optional

import anthropic
from app.config import get_settings

logger = logging.getLogger(__name__)


class AIBuilderBaseService(ABC):
    """Generic interface for wedding website AI generation and refinement."""

    @abstractmethod
    async def generate_first_draft(self, intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate first draft structured JSON from intake data (TRD §2.1)."""
        pass

    @abstractmethod
    async def refine_site(
        self, current_site_data: Dict[str, Any], refinement_request: str
    ) -> Dict[str, Any]:
        """Produce a structured diff to update site based on conversational feedback (TRD §2.2)."""
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Check provider configuration and client readiness."""
        pass


class AnthropicAIBuilderService(AIBuilderBaseService):
    """Anthropic Claude implementation of AIBuilderBaseService."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        settings = get_settings()
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.ANTHROPIC_MODEL
        self._client: Optional[anthropic.AsyncAnthropic] = None

    @property
    def client(self) -> anthropic.AsyncAnthropic:
        if self._client is None:
            if not self.api_key or not self.api_key.strip():
                raise ValueError(
                    "ANTHROPIC_API_KEY is not set in .env. Please configure your Anthropic API key."
                )
            self._client = anthropic.AsyncAnthropic(api_key=self.api_key)
        return self._client

    async def generate_first_draft(self, intake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Full prompt construction and structured generation implemented in Phase 2."""
        # Scaffolding stub for Phase 0
        raise NotImplementedError(
            "First draft generation will be implemented in Phase 2 pipeline."
        )

    async def refine_site(
        self, current_site_data: Dict[str, Any], refinement_request: str
    ) -> Dict[str, Any]:
        """Conversational refinement diff generator implemented in Phase 3."""
        # Scaffolding stub for Phase 0
        raise NotImplementedError(
            "Conversational refinement will be implemented in Phase 3."
        )

    async def check_health(self) -> Dict[str, Any]:
        configured = bool(self.api_key and self.api_key.strip())
        return {
            "provider": "anthropic",
            "model": self.model,
            "configured": configured,
            "status": "ready" if configured else "missing_api_key",
        }


def get_ai_builder_service() -> AIBuilderBaseService:
    """Factory to retrieve configured AI Builder Service provider."""
    settings = get_settings()
    provider = settings.AI_PROVIDER.lower()
    if provider == "anthropic":
        return AnthropicAIBuilderService()
    # Support for additional providers (e.g. OpenAI) can be added here
    raise ValueError(f"Unsupported AI provider: {provider}")

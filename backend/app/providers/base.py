from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ModelInfo(BaseModel):
    name: str
    digest: Optional[str] = None
    modified_at: Optional[datetime] = None
    size: Optional[int] = None


class ProviderError(Exception):
    """Base exception for provider errors."""


class ProviderUnavailableError(ProviderError):
    """Raised when the provider cannot be reached."""


class Provider(ABC):
    @abstractmethod
    def list_models(self) -> List[ModelInfo]:
        raise NotImplementedError

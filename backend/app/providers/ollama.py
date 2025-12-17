from __future__ import annotations

import json
from datetime import datetime
from typing import List
from urllib.error import URLError
from urllib.request import Request, urlopen

from .base import ModelInfo, Provider, ProviderUnavailableError, ProviderError


class OllamaProvider(Provider):
    def __init__(self, base_url: str = "http://localhost:11434") -> None:
        self.base_url = base_url.rstrip("/")

    def list_models(self) -> List[ModelInfo]:
        url = f"{self.base_url}/api/tags"
        request = Request(url, method="GET")

        try:
            with urlopen(request, timeout=5) as response:  # noqa: S310
                payload = json.load(response)
        except URLError as exc:  # pragma: no cover - runtime failure path
            raise ProviderUnavailableError("Ollama is not running or unreachable.") from exc
        except TimeoutError as exc:  # pragma: no cover - runtime failure path
            raise ProviderUnavailableError("Ollama request timed out.") from exc
        except Exception as exc:  # pragma: no cover - runtime failure path
            raise ProviderError("Failed to fetch models from Ollama.") from exc

        models = []
        for item in payload.get("models", []):
            modified_raw = item.get("modified_at")
            modified_at = None
            if isinstance(modified_raw, str):
                try:
                    modified_at = datetime.fromisoformat(modified_raw.replace("Z", "+00:00"))
                except ValueError:
                    modified_at = None

            models.append(
                ModelInfo(
                    name=item.get("name", ""),
                    digest=item.get("digest"),
                    modified_at=modified_at,
                    size=item.get("size"),
                )
            )

        return models

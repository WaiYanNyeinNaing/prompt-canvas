from __future__ import annotations

import json
import os
from datetime import datetime
from typing import List
from urllib.error import HTTPError
from urllib.error import URLError
from urllib.request import Request, urlopen

from .base import ModelInfo, Provider, ProviderUnavailableError, ProviderError
from ..core.types import ChatMessage, GenerationParams

# Default timeout for LLM generation (seconds). Override via OLLAMA_TIMEOUT env var.
DEFAULT_GENERATION_TIMEOUT = 300  # 5 minutes


class OllamaProvider(Provider):
    def __init__(self, base_url: str = "http://localhost:11434") -> None:
        self.base_url = base_url.rstrip("/")
        # Allow configuring timeout via environment variable
        timeout_str = os.environ.get("OLLAMA_TIMEOUT", "")
        if timeout_str.strip().isdigit():
            self.generation_timeout = int(timeout_str.strip())
        else:
            self.generation_timeout = DEFAULT_GENERATION_TIMEOUT

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

    def generate(
        self, model: str, messages: List[ChatMessage], params: GenerationParams
    ) -> str:
        url = f"{self.base_url}/api/chat"

        options = {}
        if params.temperature is not None:
            options["temperature"] = params.temperature
        if params.top_p is not None:
            options["top_p"] = params.top_p
        if params.top_k is not None:
            options["top_k"] = params.top_k
        if params.max_tokens is not None:
            options["num_predict"] = params.max_tokens

        payload = {
            "model": model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
            "stream": False,
        }
        if options:
            payload["options"] = options

        request = Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            method="POST",
            headers={"Content-Type": "application/json"},
        )

        try:
            # Generation can be slow for long prompts or on first run while the model loads.
            # Timeout is configurable via OLLAMA_TIMEOUT env var (default: 300s).
            with urlopen(request, timeout=self.generation_timeout) as response:  # noqa: S310
                data = json.load(response)
        except HTTPError as exc:  # pragma: no cover - runtime failure path
            # Ollama returns useful JSON error bodies; surface them.
            try:
                body = exc.read().decode("utf-8", errors="replace")
                payload = json.loads(body) if body else {}
                message = payload.get("error") if isinstance(payload, dict) else None
                raise ProviderError(message or f"Ollama error (HTTP {exc.code}).") from exc
            except ProviderError:
                raise
            except Exception:
                raise ProviderError(f"Ollama error (HTTP {exc.code}).") from exc
        except URLError as exc:  # pragma: no cover - runtime failure path
            raise ProviderUnavailableError("Ollama is not running or unreachable.") from exc
        except TimeoutError as exc:  # pragma: no cover - runtime failure path
            raise ProviderUnavailableError(
                f"Ollama request timed out after {self.generation_timeout}s. "
                "Try a shorter prompt or increase OLLAMA_TIMEOUT."
            ) from exc
        except Exception as exc:  # pragma: no cover - runtime failure path
            raise ProviderError("Failed to reach Ollama for generation.") from exc

        if isinstance(data, dict) and data.get("error"):
            raise ProviderError(str(data["error"]))

        message = data.get("message") if isinstance(data, dict) else None
        if isinstance(message, dict):
            content = message.get("content", "")
        else:
            content = data.get("response", "") if isinstance(data, dict) else ""

        if not isinstance(content, str) or not content:
            raise ProviderError("Ollama returned an empty response.")

        return content

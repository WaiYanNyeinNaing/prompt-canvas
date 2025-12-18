from __future__ import annotations

import os
from typing import List, Optional

from google import genai
from google.genai import types
from google.api_core import exceptions as google_exceptions

from .base import ModelInfo, Provider, ProviderError, ProviderUnavailableError
from ..core.types import ChatMessage, GenerationParams

DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview"


def _parse_models(raw: str) -> List[str]:
    models = [model.strip() for model in raw.split(",") if model.strip()]
    return models or [DEFAULT_GEMINI_MODEL]


def _parse_timeout(raw: str) -> Optional[float]:
    value = raw.strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _format_error(prefix: str, exc: Exception) -> str:
    detail = str(exc).strip()
    if detail:
        return f"{prefix} {detail}"
    return prefix


_UNAVAILABLE_ERRORS = [
    google_exceptions.DeadlineExceeded,
    google_exceptions.ServiceUnavailable,
]
if hasattr(google_exceptions, "GatewayTimeout"):
    _UNAVAILABLE_ERRORS.append(google_exceptions.GatewayTimeout)
_UNAVAILABLE_ERRORS = tuple(_UNAVAILABLE_ERRORS)

_REQUEST_ERRORS = [
    google_exceptions.InvalidArgument,
    google_exceptions.PermissionDenied,
    google_exceptions.Unauthenticated,
    google_exceptions.ResourceExhausted,
]
if hasattr(google_exceptions, "TooManyRequests"):
    _REQUEST_ERRORS.append(google_exceptions.TooManyRequests)
_REQUEST_ERRORS = tuple(_REQUEST_ERRORS)


def _map_exception(exc: Exception) -> ProviderError:
    if isinstance(exc, _UNAVAILABLE_ERRORS):
        return ProviderUnavailableError("Gemini request timed out or service unavailable.")
    if isinstance(exc, _REQUEST_ERRORS):
        return ProviderError(_format_error("Gemini request failed.", exc))
    if isinstance(exc, (TimeoutError, ConnectionError)):
        return ProviderUnavailableError("Gemini is unreachable or timed out.")
    return ProviderError(_format_error("Gemini request failed.", exc))


def _extract_system_instruction(messages: List[ChatMessage]) -> Optional[str]:
    parts = [msg.content for msg in messages if msg.role == "system" and msg.content]
    if not parts:
        return None
    return "\n\n".join(parts)


def _extract_user_contents(messages: List[ChatMessage]) -> str:
    parts = [msg.content for msg in messages if msg.role == "user" and msg.content]
    if not parts:
        return ""
    if len(parts) == 1:
        return parts[0]
    return "\n\n".join(parts)


class GeminiProvider(Provider):
    def __init__(self) -> None:
        api_key = os.environ.get("GEMINI_API_KEY", "").strip()
        self.models = _parse_models(os.environ.get("GEMINI_MODELS", ""))
        self.request_timeout = _parse_timeout(os.environ.get("GEMINI_TIMEOUT", ""))
        self.client = genai.Client(api_key=api_key) if api_key else None

    def list_models(self) -> List[ModelInfo]:
        return [ModelInfo(name=model_name) for model_name in self.models]

    def generate(
        self, model: str, messages: List[ChatMessage], params: GenerationParams
    ) -> str:
        if not self.client:
            raise ProviderError("Gemini API key is missing. Set GEMINI_API_KEY.")

        try:
            config_kwargs: dict[str, object] = {}
            if params.temperature is not None:
                config_kwargs["temperature"] = params.temperature
            if params.top_p is not None:
                config_kwargs["top_p"] = params.top_p
            if params.top_k is not None:
                config_kwargs["top_k"] = params.top_k
            if params.max_tokens is not None:
                config_kwargs["max_output_tokens"] = params.max_tokens

            system_instruction = _extract_system_instruction(messages)
            if system_instruction is not None:
                config_kwargs["system_instruction"] = system_instruction

            contents = _extract_user_contents(messages)
            if config_kwargs:
                config = types.GenerateContentConfig(**config_kwargs)
                response = self.client.models.generate_content(
                    model=model, contents=contents, config=config
                )
            else:
                response = self.client.models.generate_content(model=model, contents=contents)
        except ProviderUnavailableError:
            raise
        except ProviderError:
            raise
        except Exception as exc:
            raise _map_exception(exc) from exc

        output = getattr(response, "text", None)
        if not isinstance(output, str) or not output.strip():
            raise ProviderError("Gemini returned an empty response.")

        return output

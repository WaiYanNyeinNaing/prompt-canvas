from __future__ import annotations

import logging
import time
from typing import List

from fastapi import APIRouter, HTTPException

from ..core.types import ChatMessage, ChatRequest, ChatResponse
from ..providers.base import ProviderError, ProviderUnavailableError
from ..providers.gemini import GeminiProvider

router = APIRouter()
provider = GeminiProvider()
logger = logging.getLogger(__name__)


def _validate_model(model: str) -> None:
    available = {item.name for item in provider.list_models()}
    if model not in available:
        raise HTTPException(status_code=400, detail="Unknown model requested.")


@router.post("/chat", response_model=ChatResponse)
async def run_chat(request: ChatRequest) -> ChatResponse:
    started_at = time.monotonic()
    params_dump = request.params.model_dump(exclude_none=True)

    if not request.model or not request.model.strip():
        latency_ms = int((time.monotonic() - started_at) * 1000)
        logger.warning(
            "chat error model_missing model=%s params=%s latency_ms=%s error_type=%s",
            request.model,
            params_dump,
            latency_ms,
            "BadRequest",
        )
        raise HTTPException(status_code=400, detail="Model is required.")
    _validate_model(request.model.strip())

    messages: List[ChatMessage] = []
    if request.system_prompt:
        messages.append(ChatMessage(role="system", content=request.system_prompt))
    messages.append(ChatMessage(role="user", content=request.user_input))

    logger.info(
        "chat request model=%s params=%s",
        request.model,
        params_dump,
    )
    try:
        assistant_output = provider.generate(
            model=request.model, messages=messages, params=request.params
        )
    except ProviderUnavailableError as exc:
        latency_ms = int((time.monotonic() - started_at) * 1000)
        logger.warning(
            "chat error model=%s params=%s latency_ms=%s error_type=%s",
            request.model,
            params_dump,
            latency_ms,
            exc.__class__.__name__,
        )
        raise HTTPException(status_code=503, detail="Gemini is not reachable.") from exc
    except ProviderError as exc:
        latency_ms = int((time.monotonic() - started_at) * 1000)
        logger.warning(
            "chat error model=%s params=%s latency_ms=%s error_type=%s",
            request.model,
            params_dump,
            latency_ms,
            exc.__class__.__name__,
        )
        raise HTTPException(
            status_code=502,
            detail=str(exc) or "Failed to generate response from Gemini.",
        ) from exc

    latency_ms = int((time.monotonic() - started_at) * 1000)
    logger.info(
        "chat response model=%s params=%s latency_ms=%s",
        request.model,
        params_dump,
        latency_ms,
    )
    return ChatResponse(assistant_output=assistant_output, model=request.model, latency_ms=latency_ms)

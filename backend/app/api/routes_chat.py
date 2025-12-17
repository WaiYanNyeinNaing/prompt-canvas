from __future__ import annotations

import time
from typing import List

from fastapi import APIRouter, HTTPException

from ..core.types import ChatMessage, ChatRequest, ChatResponse
from ..providers.base import ProviderError, ProviderUnavailableError
from ..providers.ollama import OllamaProvider

router = APIRouter()
provider = OllamaProvider()


@router.post("/chat", response_model=ChatResponse)
async def run_chat(request: ChatRequest) -> ChatResponse:
    if not request.model or not request.model.strip():
        raise HTTPException(status_code=400, detail="Model is required.")

    messages: List[ChatMessage] = []
    if request.system_prompt:
        messages.append(ChatMessage(role="system", content=request.system_prompt))
    messages.append(ChatMessage(role="user", content=request.user_input))

    started_at = time.monotonic()
    try:
        assistant_output = provider.generate(
            model=request.model, messages=messages, params=request.params
        )
    except ProviderUnavailableError as exc:
        raise HTTPException(status_code=503, detail="Ollama is not running or unreachable.") from exc
    except ProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc) or "Failed to generate response.") from exc

    latency_ms = int((time.monotonic() - started_at) * 1000)
    return ChatResponse(assistant_output=assistant_output, model=request.model, latency_ms=latency_ms)

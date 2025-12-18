from __future__ import annotations

import time

from fastapi import APIRouter, HTTPException

from ..core.types import ChatMessage, CompareItemResult, CompareRequest, CompareResponse
from ..providers.base import ProviderError, ProviderUnavailableError
from ..providers.ollama import OllamaProvider
from ..storage.prompts_fs import get_prompt

router = APIRouter()
provider = OllamaProvider()


@router.post("/compare", response_model=CompareResponse)
async def compare_prompts(request: CompareRequest) -> CompareResponse:
    if not request.model or not request.model.strip():
        raise HTTPException(status_code=400, detail="Model is required.")
    if not request.user_input or not request.user_input.strip():
        raise HTTPException(status_code=400, detail="User input is required.")
    if request.prompt_a_id == request.prompt_b_id:
        raise HTTPException(status_code=400, detail="Prompt ids must be different.")

    try:
        prompt_a = get_prompt(request.prompt_a_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Prompt not found.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    try:
        prompt_b = get_prompt(request.prompt_b_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Prompt not found.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    def run_generation(prompt) -> CompareItemResult:
        started_at = time.monotonic()
        messages = [
            ChatMessage(role="system", content=prompt.body_md),
            ChatMessage(role="user", content=request.user_input),
        ]

        try:
            assistant_output = provider.generate(
                model=request.model, messages=messages, params=request.params
            )
        except ProviderUnavailableError:
            raise
        except ProviderError as exc:
            latency_ms = int((time.monotonic() - started_at) * 1000)
            return CompareItemResult(
                prompt_id=prompt.id,
                prompt_name=prompt.name,
                assistant_output=None,
                error=str(exc) or "Failed to generate response.",
                latency_ms=latency_ms,
            )

        latency_ms = int((time.monotonic() - started_at) * 1000)
        return CompareItemResult(
            prompt_id=prompt.id,
            prompt_name=prompt.name,
            assistant_output=assistant_output,
            latency_ms=latency_ms,
        )

    try:
        results = [run_generation(prompt_a), run_generation(prompt_b)]
    except ProviderUnavailableError as exc:
        raise HTTPException(status_code=503, detail="Ollama is not running or unreachable.") from exc

    return CompareResponse(model=request.model, input=request.user_input, results=results)

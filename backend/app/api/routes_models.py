from fastapi import APIRouter, HTTPException

from ..providers.base import ModelInfo, ProviderUnavailableError, ProviderError
from ..providers.ollama import OllamaProvider

router = APIRouter()
provider = OllamaProvider()


@router.get("/models", response_model=dict[str, list[ModelInfo]])
async def list_models() -> dict[str, list[ModelInfo]]:
    try:
        models = provider.list_models()
    except ProviderUnavailableError as exc:
        raise HTTPException(status_code=503, detail="Ollama is not running or unreachable.") from exc
    except ProviderError as exc:
        raise HTTPException(status_code=500, detail="Failed to fetch models from provider.") from exc

    return {"models": models}

from fastapi import APIRouter, HTTPException

from ..providers.base import ModelInfo, ProviderUnavailableError, ProviderError
from ..providers.gemini import GeminiProvider

router = APIRouter()
provider = GeminiProvider()


@router.get("/models", response_model=dict[str, list[ModelInfo]])
async def list_models() -> dict[str, list[ModelInfo]]:
    try:
        models = provider.list_models()
    except ProviderUnavailableError as exc:
        raise HTTPException(status_code=503, detail="Gemini is not reachable.") from exc
    except ProviderError as exc:
        raise HTTPException(status_code=500, detail="Failed to fetch models from Gemini.") from exc

    return {"models": models}

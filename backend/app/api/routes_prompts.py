from __future__ import annotations

from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException, Response

from ..core.types import PromptMeta, PromptTemplate
from ..storage.prompts_fs import (
    create_prompt,
    delete_prompt,
    get_prompt,
    list_prompts,
    update_prompt,
)

router = APIRouter()


@router.get("/prompts", response_model=Dict[str, List[PromptMeta]])
async def list_prompts_endpoint(query: Optional[str] = None) -> Dict[str, List[PromptMeta]]:
    try:
        prompts = list_prompts(query=query)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"prompts": prompts}


@router.get("/prompts/{prompt_id}", response_model=Dict[str, PromptTemplate])
async def get_prompt_endpoint(prompt_id: str) -> Dict[str, PromptTemplate]:
    try:
        prompt = get_prompt(prompt_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Prompt not found.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"prompt": prompt}


@router.post("/prompts", response_model=Dict[str, PromptTemplate], status_code=201)
async def create_prompt_endpoint(template: PromptTemplate) -> Dict[str, PromptTemplate]:
    try:
        prompt = create_prompt(template)
    except FileExistsError as exc:
        raise HTTPException(status_code=409, detail="Prompt id already exists.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"prompt": prompt}


@router.put("/prompts/{prompt_id}", response_model=Dict[str, PromptTemplate])
async def update_prompt_endpoint(prompt_id: str, template: PromptTemplate) -> Dict[str, PromptTemplate]:
    try:
        prompt = update_prompt(prompt_id, template)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Prompt not found.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"prompt": prompt}


@router.delete("/prompts/{prompt_id}", status_code=204)
async def delete_prompt_endpoint(prompt_id: str) -> Response:
    try:
        delete_prompt(prompt_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Prompt not found.") from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return Response(status_code=204)

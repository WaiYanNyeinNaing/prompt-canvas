from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


Role = Literal["system", "user", "assistant"]


class GenerationParams(BaseModel):
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    top_k: Optional[int] = None
    max_tokens: Optional[int] = None


class ChatMessage(BaseModel):
    role: Role
    content: str


class ChatRequest(BaseModel):
    model: str
    system_prompt: str = ""
    user_input: str = ""
    params: GenerationParams = Field(default_factory=GenerationParams)


class ChatResponse(BaseModel):
    assistant_output: str
    model: str
    latency_ms: Optional[int] = None

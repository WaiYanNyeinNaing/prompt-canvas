from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


Role = Literal["system", "user", "assistant"]


class GenerationParams(BaseModel):
    temperature: Optional[float] = Field(default=None, ge=0, le=2)
    top_p: Optional[float] = Field(default=None, ge=0, le=1)
    top_k: Optional[int] = Field(default=None, ge=1)
    max_tokens: Optional[int] = Field(default=None, ge=1)

    @field_validator("temperature", "top_p", mode="before")
    @classmethod
    def _blank_to_none_float(cls, value):
        if value is None:
            return None
        if isinstance(value, str) and value.strip() == "":
            return None
        return value

    @field_validator("top_k", "max_tokens", mode="before")
    @classmethod
    def _blank_to_none_int(cls, value):
        if value is None:
            return None
        if isinstance(value, str) and value.strip() == "":
            return None
        return value


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


class CompareRequest(BaseModel):
    model: str
    prompt_a_id: str
    prompt_b_id: str
    user_input: str = ""
    params: GenerationParams = Field(default_factory=GenerationParams)


class CompareItemResult(BaseModel):
    prompt_id: str
    prompt_name: str
    assistant_output: Optional[str] = None
    error: Optional[str] = None
    latency_ms: Optional[int] = None


class CompareResponse(BaseModel):
    model: str
    input: str
    results: list[CompareItemResult] = Field(min_length=2, max_length=2)


class PromptMeta(BaseModel):
    id: str
    name: str
    tags: list[str] = Field(default_factory=list)
    updated_at: Optional[str] = None


class PromptTemplate(BaseModel):
    id: str
    name: str
    tags: list[str] = Field(default_factory=list)
    model_defaults: GenerationParams = Field(default_factory=GenerationParams)
    body_md: str
    updated_at: Optional[str] = None

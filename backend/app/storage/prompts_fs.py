from __future__ import annotations

import os
import re
from datetime import date
from pathlib import Path
from typing import Any

import yaml

from ..core.types import GenerationParams, PromptMeta, PromptTemplate


_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")


def _prompts_dir() -> Path:
    default_dir = Path(__file__).resolve().parents[3] / "prompts"
    return Path(os.getenv("PROMPTS_DIR", default_dir)).expanduser().resolve()


def _ensure_prompts_dir() -> Path:
    prompts_dir = _prompts_dir()
    prompts_dir.mkdir(parents=True, exist_ok=True)
    return prompts_dir


def _validate_prompt_id(prompt_id: str) -> None:
    if not prompt_id or not _ID_PATTERN.match(prompt_id):
        raise ValueError("Prompt id must contain only letters, numbers, hyphens, or underscores.")


def _prompt_path(prompt_id: str) -> Path:
    _validate_prompt_id(prompt_id)
    return _ensure_prompts_dir() / f"{prompt_id}.md"


def _split_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError("Prompt is missing YAML frontmatter.")

    end_index = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            end_index = idx
            break

    if end_index is None:
        raise ValueError("Prompt frontmatter is missing a closing '---' line.")

    yaml_text = "\n".join(lines[1:end_index]).strip()
    body = "\n".join(lines[end_index + 1 :])
    if body.startswith("\n"):
        body = body[1:]

    try:
        data = yaml.safe_load(yaml_text) if yaml_text else {}
    except yaml.YAMLError as exc:
        raise ValueError("Prompt frontmatter contains invalid YAML.") from exc
    if data is None:
        data = {}
    if not isinstance(data, dict):
        raise ValueError("Prompt frontmatter must be a YAML mapping.")
    return data, body


def _template_from_frontmatter(data: dict[str, Any], body: str) -> PromptTemplate:
    prompt_id = data.get("id")
    name = data.get("name")
    tags = data.get("tags") or []
    model_defaults = data.get("model_defaults") or {}
    updated_at = data.get("updated_at")

    if not isinstance(prompt_id, str) or not prompt_id.strip():
        raise ValueError("Prompt frontmatter is missing a valid 'id'.")
    if not isinstance(name, str) or not name.strip():
        raise ValueError("Prompt frontmatter is missing a valid 'name'.")
    if not isinstance(tags, list):
        raise ValueError("Prompt frontmatter 'tags' must be a list.")
    if not isinstance(model_defaults, dict):
        raise ValueError("Prompt frontmatter 'model_defaults' must be a mapping.")

    _validate_prompt_id(prompt_id)

    try:
        model_defaults_obj = GenerationParams(**model_defaults)
    except Exception as exc:
        raise ValueError("Prompt frontmatter 'model_defaults' is invalid.") from exc

    try:
        return PromptTemplate(
            id=prompt_id,
            name=name,
            tags=[str(tag) for tag in tags],
            model_defaults=model_defaults_obj,
            body_md=body,
            updated_at=updated_at if isinstance(updated_at, str) else None,
        )
    except Exception as exc:
        raise ValueError("Prompt frontmatter is invalid.") from exc


def _render_prompt(template: PromptTemplate) -> str:
    meta = {
        "id": template.id,
        "name": template.name,
        "tags": template.tags,
        "model_defaults": template.model_defaults.model_dump(exclude_none=True),
        "updated_at": template.updated_at,
    }
    yaml_text = yaml.safe_dump(meta, sort_keys=False).strip()
    body = template.body_md or ""
    text = f"---\n{yaml_text}\n---\n\n{body}"
    if not text.endswith("\n"):
        text += "\n"
    return text


def _load_prompt_from_path(path: Path) -> PromptTemplate:
    text = path.read_text(encoding="utf-8")
    data, body = _split_frontmatter(text)
    template = _template_from_frontmatter(data, body)
    return template


def list_prompts(query: str | None = None) -> list[PromptMeta]:
    prompts_dir = _ensure_prompts_dir()
    query_norm = query.lower().strip() if query else ""
    results: list[PromptMeta] = []

    for path in sorted(prompts_dir.glob("*.md")):
        template = _load_prompt_from_path(path)
        meta = PromptMeta(
            id=template.id,
            name=template.name,
            tags=template.tags,
            updated_at=template.updated_at,
        )
        if query_norm:
            haystack = " ".join(
                [
                    meta.id.lower(),
                    meta.name.lower(),
                    " ".join(tag.lower() for tag in meta.tags),
                ]
            )
            if query_norm not in haystack:
                continue
        results.append(meta)

    return results


def get_prompt(prompt_id: str) -> PromptTemplate:
    path = _prompt_path(prompt_id)
    if not path.exists():
        raise FileNotFoundError(f"Prompt '{prompt_id}' not found.")
    template = _load_prompt_from_path(path)
    if template.id != prompt_id:
        raise ValueError("Prompt id in frontmatter does not match filename.")
    return template


def create_prompt(template: PromptTemplate) -> PromptTemplate:
    _validate_prompt_id(template.id)
    path = _prompt_path(template.id)
    if path.exists():
        raise FileExistsError(f"Prompt '{template.id}' already exists.")
    updated_template = template.model_copy(update={"updated_at": date.today().isoformat()})
    path.write_text(_render_prompt(updated_template), encoding="utf-8")
    return updated_template


def update_prompt(prompt_id: str, template: PromptTemplate) -> PromptTemplate:
    _validate_prompt_id(prompt_id)
    if template.id != prompt_id:
        raise ValueError("Prompt id in request body must match URL id.")
    path = _prompt_path(prompt_id)
    if not path.exists():
        raise FileNotFoundError(f"Prompt '{prompt_id}' not found.")
    updated_template = template.model_copy(update={"updated_at": date.today().isoformat()})
    path.write_text(_render_prompt(updated_template), encoding="utf-8")
    return updated_template


def delete_prompt(prompt_id: str) -> None:
    path = _prompt_path(prompt_id)
    if not path.exists():
        raise FileNotFoundError(f"Prompt '{prompt_id}' not found.")
    path.unlink()

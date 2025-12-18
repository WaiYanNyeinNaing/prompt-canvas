from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

from .api.routes_chat import router as chat_router
from .api.routes_compare import router as compare_router
from .api.routes_models import router as models_router
from .api.routes_prompts import router as prompts_router


def create_app() -> FastAPI:
    app = FastAPI(title="Prompt Canvas API")

    # Allow frontend (dev) to call backend directly, bypassing Next.js proxy timeout
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(models_router)
    app.include_router(chat_router)
    app.include_router(compare_router)
    app.include_router(prompts_router)
    return app


app = create_app()

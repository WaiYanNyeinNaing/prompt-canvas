from fastapi import FastAPI

from .api.routes_chat import router as chat_router
from .api.routes_models import router as models_router


def create_app() -> FastAPI:
    app = FastAPI(title="Prompt Canvas API")
    app.include_router(models_router)
    app.include_router(chat_router)
    return app


app = create_app()

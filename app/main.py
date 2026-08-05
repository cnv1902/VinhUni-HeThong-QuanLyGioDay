from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.api import api_router

from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from app.core.redis import redis_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await redis_manager.connect()
    yield
    # Shutdown
    await redis_manager.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Cấu hình CORS (Cross-Origin Resource Sharing)
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

from fastapi.staticfiles import StaticFiles

app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount thư mục static chứa css, js, images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Cấu hình UI Router
from app.routes.ui import router as ui_router
app.include_router(ui_router, tags=["UI"])

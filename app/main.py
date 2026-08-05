from fastapi import FastAPI
from app.core.middleware import setup_middlewares
from app.core.config import settings
from app.api.v1.api import api_router

from app.api.v1.api import api_router

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

# Kích hoạt toàn bộ Middleware (CORS, Logging...)
setup_middlewares(app)

from fastapi.staticfiles import StaticFiles

app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount thư mục static chứa css, js, images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Cấu hình UI Router
from app.routes.ui import router as ui_router
app.include_router(ui_router, tags=["UI"])

from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.api import api_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
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

# Mount thư mục giao diện tĩnh (chứa file index.html, css, js)
app.mount("/", StaticFiles(directory="static", html=True), name="ui")

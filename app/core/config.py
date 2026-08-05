from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "FastAPI Project"
    
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 

    class Config:
        env_file = ".env"

settings = Settings()

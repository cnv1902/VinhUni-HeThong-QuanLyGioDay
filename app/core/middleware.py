from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logger import request_logger

def setup_middlewares(app: FastAPI):
    """
    Hàm cấu hình tất cả các Middleware cho ứng dụng.
    """

    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.BACKEND_CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    import time
    
    def parse_user_agent(ua_string: str) -> str:
        if not ua_string or ua_string == "Unknown":
            return "Unknown"
        if "Edg/" in ua_string:
            return f"Edge/{ua_string.split('Edg/')[-1].split('.')[0]}"
        elif "Chrome/" in ua_string:
            return f"Chrome/{ua_string.split('Chrome/')[-1].split('.')[0]}"
        elif "Firefox/" in ua_string:
            return f"Firefox/{ua_string.split('Firefox/')[-1].split('.')[0]}"
        elif "Safari/" in ua_string and "Chrome" not in ua_string:
            v = ua_string.split("Version/")[-1].split(".")[0] if "Version/" in ua_string else "Unknown"
            return f"Safari/{v}"
        elif "PostmanRuntime/" in ua_string:
            return f"Postman/{ua_string.split('PostmanRuntime/')[-1].split('.')[0]}"

        return ua_string.split(" ")[0][:20]
    
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        url = request.url.path
        
        if not url.startswith("/api/"):
            return await call_next(request)
            
        start_time = time.time()
        
        ip = request.client.host if request.client else "Unknown IP"
            
        method = request.method
        raw_ua = request.headers.get("User-Agent", "Unknown")
        user_agent = parse_user_agent(raw_ua)
        
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000

        request_logger.info({
            "ip": ip,
            "method": method,
            "url": url,
            "status": response.status_code,
            "duration_ms": round(duration_ms, 1),
            "user_agent": user_agent
        })
            
        return response

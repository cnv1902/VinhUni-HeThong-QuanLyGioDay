import redis.asyncio as redis
from app.core.config import settings

class RedisManager:
    def __init__(self):
        self.redis_client = None

    async def connect(self):
        # Thiết lập thời gian chờ cực ngắn (0.2 giây) để hệ thống thoát lỗi ngay lập tức
        # Kỹ thuật Fast Failure chống "đình trệ hệ thống" khi Redis sập
        self.redis_client = redis.from_url(
            settings.REDIS_URL, 
            decode_responses=True,
            socket_connect_timeout=0.2, # Chờ tối đa 200ms để nối máy
            socket_timeout=0.2          # Chờ tối đa 200ms để thực hiện lệnh
        )

    async def disconnect(self):
        if self.redis_client:
            await self.redis_client.aclose()

redis_manager = RedisManager()

async def get_redis():
    if not redis_manager.redis_client:
        await redis_manager.connect()
    return redis_manager.redis_client

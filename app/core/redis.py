import redis.asyncio as redis
from app.core.config import settings

class RedisManager:
    def __init__(self):
        self.redis_client = None

    async def connect(self):
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def disconnect(self):
        if self.redis_client:
            await self.redis_client.aclose()

redis_manager = RedisManager()

async def get_redis():
    if not redis_manager.redis_client:
        await redis_manager.connect()
    return redis_manager.redis_client

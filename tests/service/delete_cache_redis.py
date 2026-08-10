import asyncio
import redis.asyncio as redis
from dotenv import load_dotenv
import os

load_dotenv()
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

async def clear_redis_cache():
    print(f"Dang ket noi toi Redis tai {REDIS_URL}...")
    r = None
    try:
        # Khởi tạo kết nối
        r = redis.from_url(REDIS_URL, decode_responses=True)
        
        # Ping để kiểm tra kết nối
        await r.ping()
        
        # Lệnh flushall() sẽ xóa TOÀN BỘ dữ liệu trong tất cả các DB của Redis. 
        # (Nếu chỉ muốn xóa DB hiện tại thì dùng flushdb())
        await r.flushall()
        
        print("THANH CONG! Toan bo du lieu Cache trong Redis da bi xoa sach.")
        print("Lan goi API tiep theo, he thong se truy van truc tiep vao SQLite.")
        
    except Exception as e:
        print(f"Loi khi ket noi hoac xoa Cache Redis: {e}")
    finally:
        # Đóng kết nối an toàn
        if r:
            await r.aclose()

if __name__ == "__main__":
    # Chạy hàm bất đồng bộ
    asyncio.run(clear_redis_cache())

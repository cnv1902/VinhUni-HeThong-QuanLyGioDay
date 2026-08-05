from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.danh_muc_truong_duoc_su_dung import TruongDuocSuDungResponse
from app.services import dm_truong_duoc_su_dung_service

router = APIRouter()

@router.get("/columns/{table_name}", response_model=List[TruongDuocSuDungResponse])
async def get_table_columns(table_name: str, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách cấu hình hiển thị cột cho một bảng cụ thể.
    """
    columns = await dm_truong_duoc_su_dung_service.get_columns_by_table(db, redis_client, table_name)
    return columns

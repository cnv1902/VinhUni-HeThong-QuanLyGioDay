from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.he_thong_dm_truong_duoc_su_dung import TruongDuocSuDungResponse
from app.schemas.he_thong_tu_dien_bien_so import TuDienBienSoResponse
from app.services import he_thong_dm_truong_duoc_su_dung_service, he_thong_tu_dien_bien_so_service

router = APIRouter()

@router.get("/danh-sach-cot/{table_name}", response_model=List[TruongDuocSuDungResponse])
async def get_danh_sach_cot_theo_bang(table_name: str, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách cấu hình hiển thị cột cho một bảng cụ thể.
    """
    columns = await he_thong_dm_truong_duoc_su_dung_service.get_danh_sach_cot_theo_bang(db, redis_client, table_name)
    return columns

@router.get("/tu-dien-bien-so", response_model=List[TuDienBienSoResponse])
async def get_danh_sach_tu_dien_bien_so(
    id_he: Optional[int] = None,
    trang_thai: Optional[int] = None,
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """
    Lấy danh sách từ điển biến số.
    """
    columns = await he_thong_tu_dien_bien_so_service.get_danh_sach_tu_dien_bien_so(db, redis_client, id_he, trang_thai)
    return columns


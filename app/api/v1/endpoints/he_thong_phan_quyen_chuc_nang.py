from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db, get_current_hs_id
from app.core.redis import get_redis
from app.schemas.he_thong_phan_quyen_chuc_nang import ViewHeThongPhanQuyenChucNangResponse
from app.services import he_thong_phan_quyen_chuc_nang_service

router = APIRouter()

@router.get("/", response_model=List[ViewHeThongPhanQuyenChucNangResponse])
async def get_danh_sach_chuc_nang(
    hs_id: int = Depends(get_current_hs_id),
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Lấy danh sách chức năng phân quyền của một Hồ sơ ID cụ thể
    """
    return await he_thong_phan_quyen_chuc_nang_service.get_danh_sach_chuc_nang_theo_hs_id(db, redis_client, hs_id)

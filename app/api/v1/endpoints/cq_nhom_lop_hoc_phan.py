from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse, CQNhomLopBulkUpdate, CQNhomLopBulkUpdateResponse
from app.services import cq_nhom_lop_hoc_phan_service as services_cq_nhom_lop

router = APIRouter()

@router.get("/", response_model=List[CQNhomLopResponse])
async def get_danh_sach_nhom_lop_hoc_phan_theo_hoc_ky(
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis), 
    hoc_ky: Optional[str] = None,
    trang_thai_loc: Optional[str] = None
):
    """
    Lấy danh sách các nhóm lớp học phần hệ chính quy
    """
    columns = await services_cq_nhom_lop.get_danh_sach_nhom_lop_hoc_phan_theo_hoc_ky(db, redis_client, hoc_ky=hoc_ky, trang_thai_loc=trang_thai_loc)
    return columns

@router.put("/bulk-update", response_model=CQNhomLopBulkUpdateResponse)
async def bulk_update_nhom_lop_hoc_phan(
    obj_in: CQNhomLopBulkUpdate, 
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """Cập nhật hàng loạt (Smart Diff & Dynamic Fields) Nhóm Lớp Học Phần"""
    return await services_cq_nhom_lop.bulk_update(db, redis_client, obj_in)

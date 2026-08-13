from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.services import he_thong_he_so_lop_dong_service
from app.schemas.he_thong_he_so_lop_dong import HeSoLopDongResponse, HeSoLopDongSimple, HeSoLopDongBulkUpdate

router = APIRouter()

@router.get("/", response_model=List[HeSoLopDongResponse])
async def get_all_he_so_lop_dong(
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """Lấy danh sách tất cả cấu hình hệ số lớp đông"""
    return await he_thong_he_so_lop_dong_service.get_all(db, redis_client)

@router.get("/danh-sach-don-gian", response_model=List[HeSoLopDongSimple])
async def get_danh_sach_don_gian(
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """Lấy danh sách hệ số lớp đông rút gọn (dành cho Combobox)"""
    return await he_thong_he_so_lop_dong_service.get_danh_sach_don_gian(db, redis_client)

@router.put("/bulk-update")
async def bulk_update_he_so_lop_dong(
    obj_in: HeSoLopDongBulkUpdate, 
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """Cập nhật hàng loạt từ điển hệ số lớp đông (Thêm/Sửa/Xóa)"""
    return await he_thong_he_so_lop_dong_service.bulk_update(db, redis_client, obj_in)

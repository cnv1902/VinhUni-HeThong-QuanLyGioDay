from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.he_thong_nhom_cong_thuc import NhomCongThucResponse, NhomCongThucCreate
from app.services import he_thong_nhom_cong_thuc_service

router = APIRouter()

@router.get("/", response_model=List[NhomCongThucResponse])
async def get_danh_sach_nhom_cong_thuc(db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách tất cả các nhóm công thức (Kèm Tên tham chiếu)
    """
    return await he_thong_nhom_cong_thuc_service.get_danh_sach(db, redis_client)

@router.get("/theo-hoc-ky/", response_model=List[NhomCongThucResponse])
async def get_danh_sach_nhom_cong_thuc_theo_hoc_ky(
    hocky_namhoc: str,
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Lọc danh sách các nhóm công thức theo chuỗi Học kỳ - Năm học (VD: 1_2023-2024)
    """
    return await he_thong_nhom_cong_thuc_service.get_danh_sach_theo_hoc_ky(db, redis_client, hocky_namhoc)

@router.post("/", response_model=NhomCongThucResponse)
async def create_nhom_cong_thuc(
    obj_in: NhomCongThucCreate,
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Tạo mới một Nhóm công thức quy đổi
    """
    return await he_thong_nhom_cong_thuc_service.create_nhom_cong_thuc(db, redis_client, obj_in)

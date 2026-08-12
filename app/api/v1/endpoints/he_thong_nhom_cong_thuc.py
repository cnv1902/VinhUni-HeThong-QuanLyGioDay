from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.he_thong_nhom_cong_thuc import NhomCongThucResponse, NhomCongThucCreate, NhomCongThucUpdate, NhomCongThucBulkUpdate
from app.services import he_thong_nhom_cong_thuc_service

router = APIRouter()

@router.get("/", response_model=List[NhomCongThucResponse])
async def get_danh_sach_nhom_cong_thuc(
    id_he: Optional[int] = None,
    trang_thai: Optional[int] = None,
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """
    Lấy danh sách tất cả các nhóm công thức (có thể lọc theo hệ đào tạo và trạng thái)
    """
    if id_he is not None or trang_thai is not None:
        return await he_thong_nhom_cong_thuc_service.get_danh_sach_theo_he_va_trang_thai(db, redis_client, id_he, trang_thai)
    return await he_thong_nhom_cong_thuc_service.get_danh_sach(db, redis_client)

@router.get("/theo-nam-tai-chinh/", response_model=List[NhomCongThucResponse])
async def get_danh_sach_nhom_cong_thuc_theo_nam_tai_chinh(
    nam_tai_chinh: int,
    id_he: Optional[int] = None,
    trang_thai: Optional[int] = None,
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Lọc danh sách các nhóm công thức theo Năm tài chính (VD: 2023)
    """
    return await he_thong_nhom_cong_thuc_service.get_danh_sach_theo_nam_tai_chinh(db, redis_client, nam_tai_chinh, id_he, trang_thai)

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

@router.put("/{id_nhom_ct}", response_model=NhomCongThucResponse)
async def update_nhom_cong_thuc(
    id_nhom_ct: int,
    obj_in: NhomCongThucUpdate,
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Cập nhật Nhóm công thức quy đổi
    """
    return await he_thong_nhom_cong_thuc_service.update_nhom_cong_thuc(db, redis_client, id_nhom_ct, obj_in)

@router.delete("/{id_nhom_ct}")
async def delete_nhom_cong_thuc(
    id_nhom_ct: int,
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Xóa Nhóm công thức quy đổi
    """
    return await he_thong_nhom_cong_thuc_service.delete_nhom_cong_thuc(db, redis_client, id_nhom_ct)

@router.put("/{id_nhom_ct}/bulk-update")
async def bulk_update_nhom_cong_thuc(
    id_nhom_ct: int,
    obj_in: NhomCongThucBulkUpdate,
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Cập nhật hàng loạt Hệ số lớp đông và Trường hợp công thức theo Nhóm
    """
    return await he_thong_nhom_cong_thuc_service.bulk_update_cong_thuc(db, redis_client, id_nhom_ct, obj_in)

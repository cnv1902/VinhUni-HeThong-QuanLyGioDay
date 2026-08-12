from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.services import he_thong_he_so_lop_dong_service
from app.schemas.he_thong_he_so_lop_dong import HeSoLopDongResponse, HeSoLopDongCreate, HeSoLopDongUpdate

router = APIRouter()

@router.get("/nhom-cong-thuc/{id_nhom_ct}")
async def get_he_so_lop_dong_by_nhom(id_nhom_ct: int, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Lấy danh sách hệ số lớp đông thuộc nhóm công thức quy đổi"""
    danh_sach = await he_thong_he_so_lop_dong_service.get_danh_sach_theo_nhom(db, redis_client, id_nhom_ct=id_nhom_ct)
    return danh_sach

@router.post("/", response_model=HeSoLopDongResponse)
async def create_he_so_lop_dong(obj_in: HeSoLopDongCreate, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Tạo mới hệ số lớp đông"""
    new_obj = await he_thong_he_so_lop_dong_service.create(db, redis_client, obj_in=obj_in)
    return new_obj

@router.put("/{id}", response_model=HeSoLopDongResponse)
async def update_he_so_lop_dong(id: int, obj_in: HeSoLopDongUpdate, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Cập nhật hệ số lớp đông"""
    updated_obj = await he_thong_he_so_lop_dong_service.update(db, redis_client, id_he_so_ld=id, obj_in=obj_in)
    return updated_obj

@router.delete("/{id}")
async def delete_he_so_lop_dong(id: int, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Xóa hệ số lớp đông"""
    return await he_thong_he_so_lop_dong_service.delete(db, redis_client, id_he_so_ld=id)

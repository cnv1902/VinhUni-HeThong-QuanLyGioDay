from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.services import he_thong_truong_hop_cong_thuc_service
from app.schemas.he_thong_truong_hop_cong_thuc import TruongHopCongThucResponse, TruongHopCongThucCreate, TruongHopCongThucUpdate

router = APIRouter()

@router.get("/nhom-cong-thuc/{id_nhom_ct}")
async def get_truong_hop_cong_thuc_by_nhom(id_nhom_ct: int, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Lấy danh sách trường hợp công thức thuộc nhóm công thức quy đổi"""
    danh_sach = await he_thong_truong_hop_cong_thuc_service.get_danh_sach_theo_nhom(db, redis_client, id_nhom_ct=id_nhom_ct)
    return danh_sach

@router.post("/", response_model=TruongHopCongThucResponse)
async def create_truong_hop_cong_thuc(obj_in: TruongHopCongThucCreate, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Tạo mới trường hợp công thức"""
    new_obj = await he_thong_truong_hop_cong_thuc_service.create(db, redis_client, obj_in=obj_in)
    return new_obj

@router.put("/{id}", response_model=TruongHopCongThucResponse)
async def update_truong_hop_cong_thuc(id: int, obj_in: TruongHopCongThucUpdate, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Cập nhật trường hợp công thức"""
    updated_obj = await he_thong_truong_hop_cong_thuc_service.update(db, redis_client, id_truong_hop=id, obj_in=obj_in)
    return updated_obj

@router.delete("/{id}")
async def delete_truong_hop_cong_thuc(id: int, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """Xóa trường hợp công thức"""
    return await he_thong_truong_hop_cong_thuc_service.delete(db, redis_client, id_truong_hop=id)

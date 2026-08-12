from sqlalchemy.orm import Session
from app.models.he_thong_he_so_lop_dong import HeThongHeSoLopDong
from app.schemas.he_thong_he_so_lop_dong import HeSoLopDongCreate, HeSoLopDongUpdate

def get_by_id(db: Session, id_he_so_ld: int):
    """Lấy chi tiết 1 cấu hình hệ số lớp đông"""
    return db.query(HeThongHeSoLopDong).filter(HeThongHeSoLopDong.ID_HeSo_LD == id_he_so_ld).first()

def get_danh_sach_theo_nhom(db: Session, id_nhom_ct: int):
    """Lấy danh sách hệ số lớp đông thuộc về 1 nhóm công thức"""
    return db.query(HeThongHeSoLopDong).filter(HeThongHeSoLopDong.ID_Nhom_CT == id_nhom_ct).all()

def create(db: Session, obj_in: HeSoLopDongCreate):
    """Thêm mới mốc hệ số lớp đông"""
    db_obj = HeThongHeSoLopDong(
        ID_Nhom_CT=obj_in.ID_Nhom_CT,
        GiaTri_Min=obj_in.GiaTri_Min,
        GiaTri_Max=obj_in.GiaTri_Max,
        BieuThuc_HeSoLopDong=obj_in.BieuThuc_HeSoLopDong
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: HeThongHeSoLopDong):
    """Lưu thay đổi vào CSDL"""
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, db_obj: HeThongHeSoLopDong):
    """Xóa hệ số lớp đông"""
    db.delete(db_obj)
    db.commit()
    return db_obj

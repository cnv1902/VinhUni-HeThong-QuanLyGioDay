from sqlalchemy.orm import Session
from app.models.he_thong_he_so_lop_dong import HeThongHeSoLopDong
from app.schemas.he_thong_he_so_lop_dong import HeSoLopDongCreate

def get_by_id(db: Session, id_he_so_ld: int):
    """Lấy chi tiết 1 cấu hình hệ số lớp đông"""
    return db.query(HeThongHeSoLopDong).filter(HeThongHeSoLopDong.ID_HeSo_LD == id_he_so_ld).first()

def get_all(db: Session):
    """Lấy danh sách tất cả hệ số lớp đông (không bị xóa)"""
    return db.query(HeThongHeSoLopDong).filter(HeThongHeSoLopDong.Is_Delete == False).all()

def create(db: Session, obj_in: HeSoLopDongCreate):
    """Thêm mới mốc hệ số lớp đông"""
    db_obj = HeThongHeSoLopDong(
        Ten_HeSo_LD=obj_in.Ten_HeSo_LD,
        CauHinh_Json=obj_in.CauHinh_Json,
        TrangThai=obj_in.TrangThai,
        Is_Delete=False
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
    """Xóa hệ số lớp đông (Soft Delete)"""
    db_obj.Is_Delete = True
    db.commit()
    return db_obj

def execute_bulk_transaction(
    db: Session, 
    inserts: list,
    deletes: list
):
    """Thực thi thao tác DB (thêm mới, sửa) trong 1 transaction duy nhất"""
    for payload in inserts:
        new_ld = HeThongHeSoLopDong(
            Ten_HeSo_LD=payload.Ten_HeSo_LD,
            CauHinh_Json=payload.CauHinh_Json,
            TrangThai=payload.TrangThai,
            Is_Delete=False
        )
        db.add(new_ld)
        
    for db_item in deletes:
        # Soft delete instead of hard delete
        db_item.Is_Delete = True
        
    db.commit()

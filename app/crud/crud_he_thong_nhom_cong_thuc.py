from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.models.he_thong_nhom_cong_thuc import HeThongNhomCongThuc
from app.models.he_thong_he_so_lop_dong import HeThongHeSoLopDong
from app.models.he_thong_truong_hop_cong_thuc import HeThongTruongHopCongThuc
from app.schemas.he_thong_nhom_cong_thuc import NhomCongThucCreate, NhomCongThucUpdate

def get_by_id(db: Session, id_nhom_ct: int):
    """Lấy chi tiết 1 nhóm công thức theo ID"""
    return db.query(HeThongNhomCongThuc).filter(HeThongNhomCongThuc.ID_Nhom_CT == id_nhom_ct).first()

def get_danh_sach(db: Session):
    """Lấy toàn bộ nhóm công thức, dùng LEFT OUTER JOIN cho bảng hệ đào tạo."""
    return db.query(HeThongNhomCongThuc).options(
        joinedload(HeThongNhomCongThuc.he_dao_tao),
    ).filter(
        HeThongNhomCongThuc.Is_Delete == False
    ).all()

def get_danh_sach_theo_he_va_trang_thai(db: Session, id_he: Optional[int] = None, trang_thai: Optional[int] = None):
    """Lọc nhóm công thức theo hệ đào tạo và trạng thái (không lọc năm)."""
    query = db.query(HeThongNhomCongThuc).options(
        joinedload(HeThongNhomCongThuc.he_dao_tao),
    ).filter(
        HeThongNhomCongThuc.Is_Delete == False
    )
    
    if id_he is not None:
        query = query.filter(HeThongNhomCongThuc.ID_He == id_he)
    if trang_thai is not None:
        query = query.filter(HeThongNhomCongThuc.TrangThai == bool(trang_thai))
        
    return query.all()

def get_danh_sach_theo_nam_tai_chinh(db: Session, nam_tai_chinh: int, id_he: Optional[int] = None, trang_thai: Optional[int] = None):
    """Lọc nhóm công thức theo năm tài chính."""
    query = db.query(HeThongNhomCongThuc).options(
        joinedload(HeThongNhomCongThuc.he_dao_tao),
    ).filter(
        HeThongNhomCongThuc.Is_Delete == False,
        HeThongNhomCongThuc.TuNam <= nam_tai_chinh,
        (HeThongNhomCongThuc.DenNam == None) | (HeThongNhomCongThuc.DenNam >= nam_tai_chinh)
    )
    
    if id_he is not None:
        query = query.filter(HeThongNhomCongThuc.ID_He == id_he)
    if trang_thai is not None:
        query = query.filter(HeThongNhomCongThuc.TrangThai == bool(trang_thai))
        
    return query.all()

def create_nhom_cong_thuc(db: Session, obj_in: NhomCongThucCreate):
    """Tạo mới nhóm công thức"""
    db_obj = HeThongNhomCongThuc(
        ID_He=obj_in.ID_He,
        DsMaHTHoc=obj_in.DsMaHTHoc,
        TuNam=obj_in.TuNam,
        DenNam=obj_in.DenNam,
        GhiChu_DieuKien=obj_in.GhiChu_DieuKien,
        TrangThai=obj_in.TrangThai,
        Is_Delete=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_nhom_cong_thuc(db: Session, db_obj: HeThongNhomCongThuc):
    """Lưu thay đổi vào CSDL"""
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_nhom_cong_thuc(db: Session, db_obj: HeThongNhomCongThuc):
    db.delete(db_obj)
    db.commit()
    return db_obj



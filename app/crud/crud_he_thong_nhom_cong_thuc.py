from sqlalchemy.orm import Session, joinedload
from app.models.he_thong_nhom_cong_thuc import HeThongNhomCongThuc
from app.schemas.he_thong_nhom_cong_thuc import NhomCongThucCreate, NhomCongThucUpdate

def get_by_id(db: Session, id_nhom_ct: int):
    """Lấy chi tiết 1 nhóm công thức theo ID"""
    return db.query(HeThongNhomCongThuc).filter(HeThongNhomCongThuc.ID_Nhom_CT == id_nhom_ct).first()

def get_danh_sach(db: Session):
    """Lấy toàn bộ nhóm công thức, dùng LEFT OUTER JOIN cho bảng học kỳ."""
    return db.query(HeThongNhomCongThuc).options(
        joinedload(HeThongNhomCongThuc.he_dao_tao)
    ).all()

def get_danh_sach_theo_hoc_ky(db: Session, ma_hoc_ky: int):
    """Lọc nhóm công thức theo ID của học kỳ học phần."""
    return db.query(HeThongNhomCongThuc).options(
        joinedload(HeThongNhomCongThuc.he_dao_tao)
    ).filter(
        HeThongNhomCongThuc.TuMaHocKy <= ma_hoc_ky,
        (HeThongNhomCongThuc.DenMaHocKy == None) | (HeThongNhomCongThuc.DenMaHocKy >= ma_hoc_ky)
    ).all()

def create_nhom_cong_thuc(db: Session, obj_in: NhomCongThucCreate):
    """Tạo mới nhóm công thức"""
    db_obj = HeThongNhomCongThuc(
        ID_He=obj_in.ID_He,
        TenNhomCongThuc=obj_in.TenNhomCongThuc,
        DsMaHTHoc=obj_in.DsMaHTHoc,
        TuMaHocKy=obj_in.TuMaHocKy,
        DenMaHocKy=obj_in.DenMaHocKy,
        GhiChu_DieuKien=obj_in.GhiChu_DieuKien,
        TrangThai=obj_in.TrangThai
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_nhom_cong_thuc(db: Session, db_obj: HeThongNhomCongThuc, obj_in: NhomCongThucUpdate):
    """Cập nhật nhóm công thức"""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_nhom_cong_thuc(db: Session, id_nhom_ct: int):
    """Xóa nhóm công thức"""
    db_obj = get_by_id(db, id_nhom_ct)
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj

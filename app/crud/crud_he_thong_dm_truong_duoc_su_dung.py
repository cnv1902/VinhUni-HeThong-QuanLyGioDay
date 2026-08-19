from sqlalchemy.orm import Session
from typing import Optional
from app.models.he_thong_dm_truong_duoc_su_dung import DMTruongSuDung

def get_danh_sach_cot_theo_bang(db: Session, MaBang: str):
    """
    Lấy danh sách cấu hình hiển thị cột cho một bảng cụ thể.
    """
    return db.query(DMTruongSuDung).filter(
        DMTruongSuDung.MaBang == MaBang,
        DMTruongSuDung.HienThi == True
    ).order_by(DMTruongSuDung.ThuTuHienThi).all()

def get_all_config_columns(db: Session, MaBang: Optional[str] = None):
    """
    Lấy danh sách TẤT CẢ các cột (Bao gồm cả cột đang bị ẩn). Dành cho trang quản trị.
    Nếu MaBang = 'all' hoặc None, lấy toàn bộ.
    """
    query = db.query(DMTruongSuDung)
    if MaBang and MaBang != 'all':
        query = query.filter(DMTruongSuDung.MaBang == MaBang)
    return query.order_by(DMTruongSuDung.MaBang, DMTruongSuDung.ThuTuHienThi).all()

def get_editable_fields(db: Session, table_name: str) -> list[str]:
    """
    Lấy danh sách các cột được phép sửa (DuocSua == True) của một bảng.
    """
    results = db.query(DMTruongSuDung.MaTruong).filter(
        DMTruongSuDung.MaBang == table_name,
        DMTruongSuDung.DuocSua == True
    ).all()
    return [r[0] for r in results]

def get_danh_sach_bang(db: Session):
    """
    Lấy danh sách các Mã bảng (MaBang) duy nhất trong cấu hình.
    """
    results = db.query(DMTruongSuDung.MaBang, DMTruongSuDung.TenBang).distinct().all()
    return [{"MaBang": r[0], "TenBang": r[1]} for r in results]

def bulk_update(db: Session, updates: list[dict]):
    """
    Cập nhật hàng loạt nhiều cấu hình cột sử dụng bulk_update_mappings.
    """
    affected_tables = set()
    if updates:
        for item in updates:
            if "MaBang" in item:
                affected_tables.add(item["MaBang"])
                
        db.bulk_update_mappings(DMTruongSuDung, updates)
        db.commit()

    return updates, list(affected_tables)

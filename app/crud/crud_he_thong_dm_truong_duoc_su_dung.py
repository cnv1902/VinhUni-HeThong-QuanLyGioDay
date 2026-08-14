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
    Cập nhật hàng loạt nhiều cấu hình cột.
    """
    updated_records = []
    affected_tables = set()

    for item in updates:
        db_obj = db.query(DMTruongSuDung).filter(DMTruongSuDung.ID == item["ID"]).first()
        if db_obj:
            # Chỉ update field nào được gửi lên (không None)
            if item.get("TenTruong") is not None: db_obj.TenTruong = item["TenTruong"]
            if item.get("DoRong") is not None: db_obj.DoRong = item["DoRong"]
            if item.get("CanLe") is not None: db_obj.CanLe = item["CanLe"]
            if item.get("KieuTruong") is not None: db_obj.KieuTruong = item["KieuTruong"]
            if item.get("ThuTuHienThi") is not None: db_obj.ThuTuHienThi = item["ThuTuHienThi"]
            if "HienThi" in item and item["HienThi"] is not None: db_obj.HienThi = item["HienThi"]
            if "DuocSua" in item and item["DuocSua"] is not None: db_obj.DuocSua = item["DuocSua"]
            if "GhimCot" in item and item["GhimCot"] is not None: db_obj.GhimCot = item["GhimCot"]

            affected_tables.add(db_obj.MaBang)
            updated_records.append(db_obj)

    db.commit()
    return updated_records, list(affected_tables)

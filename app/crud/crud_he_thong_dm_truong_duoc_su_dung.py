from sqlalchemy.orm import Session
from app.models.he_thong_dm_truong_duoc_su_dung import DMTruongSuDung

def get_danh_sach_cot_theo_bang(db: Session, table_name: str):
    """
    Lấy danh sách cấu hình hiển thị cột cho một bảng cụ thể.
    """
    return db.query(DMTruongSuDung).filter(
        DMTruongSuDung.TenBang == table_name,
        DMTruongSuDung.HienThi == True
    ).order_by(DMTruongSuDung.ThuTuHienThi).all()

def get_editable_fields(db: Session, table_name: str) -> list[str]:
    """
    Lấy danh sách các cột được phép sửa (DuocSua == True) của một bảng.
    """
    results = db.query(DMTruongSuDung.MaTruong).filter(
        DMTruongSuDung.TenBang == table_name,
        DMTruongSuDung.DuocSua == True
    ).all()
    return [r[0] for r in results]

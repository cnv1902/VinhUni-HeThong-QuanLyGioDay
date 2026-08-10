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

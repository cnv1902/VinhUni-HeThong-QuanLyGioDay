from sqlalchemy.orm import Session
from app.models.view_he_thong_phan_quyen_chuc_nang import ViewHeThongPhanQuyenChucNang

def get_danh_sach_theo_hs_id(db: Session, hs_id: int):
    return (
        db.query(ViewHeThongPhanQuyenChucNang)
        .filter(
            ViewHeThongPhanQuyenChucNang.HS_ID == hs_id,
            ViewHeThongPhanQuyenChucNang.ThuocMoDul == "QLGIODAY",
            ViewHeThongPhanQuyenChucNang.CN_TrangThai == 1,
            ViewHeThongPhanQuyenChucNang.CN_HienThi == True
        )
        .order_by(ViewHeThongPhanQuyenChucNang.CN_ThuTu.asc())
        .all()
    )

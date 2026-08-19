from app.core import logger
from sqlalchemy.orm import Session
from sqlalchemy import case, func
from typing import Optional
from typing import List, Dict, Any

from app.models.cq_nhom_lop_hoc_phan import CQNhomLopHocPhan
from app.models.hinh_thuc_hoc import HinhThucHoc
from app.models.hinh_thuc_day import HinhThucDay
from app.models.cq_ke_khai import CQKeKhai
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse

def get_danh_sach(db: Session):
    da_thanh_toan_subq = (
        db.query(CQKeKhai.MaNhomLopHP)
        .filter(CQKeKhai.XacNhanThanhToan == True)
        .group_by(CQKeKhai.MaNhomLopHP)
        .subquery()
    )

    query = (
        db.query(
            CQNhomLopHocPhan,
            HinhThucHoc.TenHTHoc,
            HinhThucDay.TenHTDay,
            case((da_thanh_toan_subq.c.MaNhomLopHP.isnot(None), True), else_=False).label("TrangThaiThanhToan")
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
        .outerjoin(da_thanh_toan_subq, CQNhomLopHocPhan.MaNhomLopHP == da_thanh_toan_subq.c.MaNhomLopHP)
    ).all()

    results = []
    for cq_obj, ten_ht_hoc, ten_ht_day, trang_thai_thanh_toan in query:
        row_dict = {**cq_obj.__dict__}
        row_dict["TenHTHoc"] = ten_ht_hoc
        row_dict["TenHTDay"] = ten_ht_day
        row_dict["TrangThaiThanhToan"] = trang_thai_thanh_toan
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

def get_danh_sach_theo_nam_tai_chinh(db: Session, nam_tai_chinh: Optional[int] = None):
    da_thanh_toan_subq = (
        db.query(CQKeKhai.MaNhomLopHP)
        .filter(CQKeKhai.XacNhanThanhToan == True)
        .group_by(CQKeKhai.MaNhomLopHP)
        .subquery()
    )

    query = (
        db.query(
            CQNhomLopHocPhan,
            HinhThucHoc.TenHTHoc,
            HinhThucDay.TenHTDay,
            case((da_thanh_toan_subq.c.MaNhomLopHP.isnot(None), True), else_=False).label("TrangThaiThanhToan")
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
        .outerjoin(da_thanh_toan_subq, CQNhomLopHocPhan.MaNhomLopHP == da_thanh_toan_subq.c.MaNhomLopHP)
    ).filter(CQNhomLopHocPhan.NamTaiChinh == nam_tai_chinh).all()

    results = []
    for cq_obj, ten_ht_hoc, ten_ht_day, trang_thai_thanh_toan in query:
        row_dict = {**cq_obj.__dict__}
        row_dict["TenHTHoc"] = ten_ht_hoc
        row_dict["TenHTDay"] = ten_ht_day
        row_dict["TrangThaiThanhToan"] = trang_thai_thanh_toan
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

def get_by_ma_nhom_lop(db: Session, ma_nhom_lop_hp: str) -> Optional[CQNhomLopHocPhan]:
    return db.query(CQNhomLopHocPhan).filter(CQNhomLopHocPhan.MaNhomLopHP == ma_nhom_lop_hp).first()

def get_by_list_ma_nhom_lop(db: Session, list_ma_nhom_lop_hp: List[str]) -> List[CQNhomLopHocPhan]:
    return db.query(CQNhomLopHocPhan).filter(CQNhomLopHocPhan.MaNhomLopHP.in_(list_ma_nhom_lop_hp)).all()

def update_danh_sach(db: Session, updates_data: List[Dict[str, Any]]):
    """
    Sử dụng bulk_update_mappings của SQLAlchemy để cập nhật hàng loạt siêu tốc.
    Dữ liệu (updates_data) đã được làm sạch và xử lý logic tại tầng Service.
    """
    from app.core.logger import app_logger as logger
    if updates_data:
        db.bulk_update_mappings(CQNhomLopHocPhan, updates_data)
        db.commit()
    logger.error("[DEBUG_BULK_HTHOC_CRUD] COMMIT_DONE")

def bulk_confirm_nhom_lop_hoc_phan(db: Session, list_ma: List[str]) -> int:
    """
    Xác nhận hàng loạt nhóm lớp học phần.
    Cập nhật XacNhan = True, XacNhan_ThoiGian = now(), XacNhan_Nguoi = '1678'
    """
    result = db.query(CQNhomLopHocPhan).filter(
        CQNhomLopHocPhan.MaNhomLopHP.in_(list_ma)
    ).update({
        CQNhomLopHocPhan.XacNhan: True,
        CQNhomLopHocPhan.XacNhan_ThoiGian: func.now(),
        CQNhomLopHocPhan.XacNhan_Nguoi: "1678"
    }, synchronize_session=False)
    db.commit()
    return result
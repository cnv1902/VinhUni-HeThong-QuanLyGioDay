from app.core import logger
from sqlalchemy.orm import Session
from typing import Optional
from typing import List, Dict, Any

from app.models.cq_nhom_lop_hoc_phan import CQNhomLopHocPhan
from app.models.hinh_thuc_hoc import HinhThucHoc
from app.models.hinh_thuc_day import HinhThucDay
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse

def get_danh_sach(db: Session):
    query = (
        db.query(
            CQNhomLopHocPhan,
            HinhThucHoc.TenHTHoc,
            HinhThucDay.TenHTDay
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
    ).all()

    results = []
    for cq_obj, ten_ht_hoc, ten_ht_day in query:
        row_dict = {**cq_obj.__dict__}
        row_dict["TenHTHoc"] = ten_ht_hoc
        row_dict["TenHTDay"] = ten_ht_day
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

def get_danh_sach_theo_hoc_ky(db: Session, hoc_ky: Optional[str] = None):
    query = (
        db.query(
            CQNhomLopHocPhan,
            HinhThucHoc.TenHTHoc,
            HinhThucDay.TenHTDay
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
    ).filter(CQNhomLopHocPhan.HocKy == hoc_ky).all()

    results = []
    for cq_obj, ten_ht_hoc, ten_ht_day in query:
        row_dict = {**cq_obj.__dict__}
        row_dict["TenHTHoc"] = ten_ht_hoc
        row_dict["TenHTDay"] = ten_ht_day
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

def get_by_ma_nhom_lop(db: Session, ma_nhom_lop_hp: str) -> Optional[CQNhomLopHocPhan]:
    return db.query(CQNhomLopHocPhan).filter(CQNhomLopHocPhan.MaNhomLopHP == ma_nhom_lop_hp).first()

def get_by_list_ma_nhom_lop(db: Session, list_ma_nhom_lop_hp: List[str]) -> List[CQNhomLopHocPhan]:
    return db.query(CQNhomLopHocPhan).filter(CQNhomLopHocPhan.MaNhomLopHP.in_(list_ma_nhom_lop_hp)).all()

def update_danh_sach(db: Session, updates_data: List[Dict[str, Any]]):
    """
    CRUD chỉ nhận List[dict] có chứa khóa chính (MaNhomLopHP) và thực hiện gán giá trị (Explicit Assignment).
    Mọi tính toán (như SoSinhVien) phải do Service cung cấp trong dict.
    """
    from app.core.logger import app_logger as logger
    for data in updates_data:
        ma_nhom_lop_hp = data.get("MaNhomLopHP")
        if not ma_nhom_lop_hp:
            continue
            
        db_item = get_by_ma_nhom_lop(db, ma_nhom_lop_hp)
        if db_item:
            for key, value in data.items():
                if key != "MaNhomLopHP" and hasattr(db_item, key):
                    
                    logger.error(
                        f"[DEBUG_BULK_HTHOC_CRUD] SET item={ma_nhom_lop_hp}, "
                        f"key={key}, old={getattr(db_item, key, None)}, new={value}"
                    )
                    setattr(db_item, key, value)
                    
    db.commit()
    logger.error("[DEBUG_BULK_HTHOC_CRUD] COMMIT_DONE")
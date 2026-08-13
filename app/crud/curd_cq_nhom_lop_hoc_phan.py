from sqlalchemy.orm import Session
from typing import Optional

from app.models.cq_nhom_lop_hoc_phan import CQNhomLopHocPhan
from app.models.hinh_thuc_hoc import HinhThucHoc
from app.models.hinh_thuc_day import HinhThucDay
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse

def get_danh_sach(db: Session):
    query = (
        db.query(
            CQNhomLopHocPhan.ID,
            CQNhomLopHocPhan.MaNhomLopHP,
            CQNhomLopHocPhan.TenNhomLopHP,
            CQNhomLopHocPhan.SoSinhVien,
            CQNhomLopHocPhan.SiSoDangKyHienTai,
            CQNhomLopHocPhan.SiSoChuyenDoi,
            CQNhomLopHocPhan.SiSoDKH,
            CQNhomLopHocPhan.HocKy,
            HinhThucHoc.TenHTHoc,
            HinhThucDay.TenHTDay,
            CQNhomLopHocPhan.LopChuyen,
            CQNhomLopHocPhan.SoTinChi,
            CQNhomLopHocPhan.SoTietLT,
            CQNhomLopHocPhan.SotietTH,
            CQNhomLopHocPhan.SoTietBT,
            CQNhomLopHocPhan.SotietDA,
            CQNhomLopHocPhan.SotietThucTap,
            CQNhomLopHocPhan.SotietDoAnKhoaLuan,
            CQNhomLopHocPhan.SoTietLTQD,
            CQNhomLopHocPhan.SoTietTHQD,
            CQNhomLopHocPhan.SoTietBTQD,
            CQNhomLopHocPhan.KhoaCN,
            CQNhomLopHocPhan.ID_LanTongHopFile,
            CQNhomLopHocPhan.HeSoHocDi,
            CQNhomLopHocPhan.XacNhan,
            CQNhomLopHocPhan.NamTaiChinh
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
    ).all()

    results = []
    for row in query:
        row_dict = row._mapping
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

def get_danh_sach_theo_hoc_ky(db: Session, hoc_ky: Optional[str] = None):
    query = (
        db.query(
            CQNhomLopHocPhan.ID,
            CQNhomLopHocPhan.MaNhomLopHP,
            CQNhomLopHocPhan.TenNhomLopHP,
            CQNhomLopHocPhan.SoSinhVien,
            CQNhomLopHocPhan.SiSoDangKyHienTai,
            CQNhomLopHocPhan.SiSoChuyenDoi,
            CQNhomLopHocPhan.SiSoDKH,
            CQNhomLopHocPhan.HocKy,
            HinhThucHoc.TenHTHoc,
            HinhThucDay.TenHTDay,
            CQNhomLopHocPhan.LopChuyen,
            CQNhomLopHocPhan.SoTinChi,
            CQNhomLopHocPhan.SoTietLT,
            CQNhomLopHocPhan.SotietTH,
            CQNhomLopHocPhan.SoTietBT,
            CQNhomLopHocPhan.SotietDA,
            CQNhomLopHocPhan.SotietThucTap,
            CQNhomLopHocPhan.SotietDoAnKhoaLuan,
            CQNhomLopHocPhan.SoTietLTQD,
            CQNhomLopHocPhan.SoTietTHQD,
            CQNhomLopHocPhan.SoTietBTQD,
            CQNhomLopHocPhan.KhoaCN,
            CQNhomLopHocPhan.ID_LanTongHopFile,
            CQNhomLopHocPhan.HeSoHocDi,
            CQNhomLopHocPhan.XacNhan,
            CQNhomLopHocPhan.NamTaiChinh
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
    ).filter(CQNhomLopHocPhan.HocKy == hoc_ky).all()

    results = []
    for row in query:
        row_dict = row._mapping
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

from typing import List, Dict, Any

def get_by_ma_nhom_lop(db: Session, ma_nhom_lop_hp: str) -> Optional[CQNhomLopHocPhan]:
    return db.query(CQNhomLopHocPhan).filter(CQNhomLopHocPhan.MaNhomLopHP == ma_nhom_lop_hp).first()

def get_by_list_ma_nhom_lop(db: Session, list_ma_nhom_lop_hp: List[str]) -> List[CQNhomLopHocPhan]:
    return db.query(CQNhomLopHocPhan).filter(CQNhomLopHocPhan.MaNhomLopHP.in_(list_ma_nhom_lop_hp)).all()

def update_danh_sach(db: Session, updates_data: List[Dict[str, Any]]):
    """
    CRUD chỉ nhận List[dict] có chứa khóa chính (MaNhomLopHP) và thực hiện gán giá trị (Explicit Assignment).
    Mọi tính toán (như SoSinhVien) phải do Service cung cấp trong dict.
    """
    for data in updates_data:
        ma_nhom_lop_hp = data.get("MaNhomLopHP")
        if not ma_nhom_lop_hp:
            continue
            
        db_item = get_by_ma_nhom_lop(db, ma_nhom_lop_hp)
        if db_item:
            for key, value in data.items():
                if key != "MaNhomLopHP" and hasattr(db_item, key):
                    setattr(db_item, key, value)
    db.commit()
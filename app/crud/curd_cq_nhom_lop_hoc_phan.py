from sqlalchemy.orm import Session
from typing import Optional

from app.models.cq_nhom_lop_hoc_phan import CQNhomLopHocPhan
from app.models.hinh_thuc_hoc import HinhThucHoc
from app.models.hinh_thuc_day import HinhThucDay
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse

def get_danh_sach(db: Session, ma_hoc_ky: Optional[int] = None):
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
            CQNhomLopHocPhan.XacNhan
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
    ).all()

    results = []
    for row in query:
        row_dict = row._mapping
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

def get_danh_sach_theo_hoc_ky(db: Session, ma_hoc_ky: Optional[int] = None):
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
            CQNhomLopHocPhan.XacNhan
        )
        .outerjoin(HinhThucHoc, CQNhomLopHocPhan.MaHTHoc == HinhThucHoc.MaHTHoc)
        .outerjoin(HinhThucDay, CQNhomLopHocPhan.MaHTDay == HinhThucDay.MaHTDay)
    ).filter(CQNhomLopHocPhan.MaHocKy == ma_hoc_ky).all()

    results = []
    for row in query:
        row_dict = row._mapping
        results.append(CQNhomLopResponse(**row_dict))
    
    return results
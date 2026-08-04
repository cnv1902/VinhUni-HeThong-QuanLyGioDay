from sqlalchemy.orm import Session
from typing import Optional

from app.models.cq_nhom_lop_hoc_phan import CQNhomLopHocPhan
from app.models.hinh_thuc_hoc import HinhThucHoc
from app.models.hinh_thuc_day import HinhThucDay
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse

def get_danh_sach(db: Session, ma_hoc_ky: Optional[int] = None):
    query = (
        db.query(
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
    )
    
    if ma_hoc_ky != None:
        query = query.filter(CQNhomLopHocPhan.MaHocKy == ma_hoc_ky)

    # query = query.order_by(CQNhomLopHocPhan.ID).all()
    
    # Convert query results to dictionary so Pydantic can parse them
    results = []
    for row in query:
        row_dict = row._mapping
        results.append(CQNhomLopResponse(**row_dict))
    
    return results

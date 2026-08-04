from sqlalchemy.orm import Session
from app.models.hoc_ky import HocKy
from app.schemas.hoc_ky import HocKyResponse

def get_danh_sach(db:Session):
    query = db.query(
        HocKy.MaHocKy,
        HocKy.TenHocKy,
        HocKy.NamHoc,
        HocKy.HocKy,
        HocKy.HocKy_CMC,
        HocKy.HienTai,
        HocKy.TrangThaiHeThong,
        HocKy.TrangThai_MacDinh,
        HocKy.TrangThai_CQ,
        HocKy.TrangThai_VLVH,
        HocKy.TrangThai_SDH,
        HocKy.TrangThai_NCKH,
        HocKy.TrangThai_HDCM,
        HocKy.TrangThai_DAKL,
        HocKy.TrangThai_DTTX,
        HocKy.TrangThai_Chuyen,
        HocKy.ThoiHan_HDCM,
        HocKy.TrangThai_THCS,
        HocKy.TrangThai_Khac,
        HocKy.DuocChuyenVeHocKy_Ma,
        HocKy.DuocChuyenVeHocKy_Ten,
        HocKy.NamTaiChinh,
        HocKy.TrangThai_DKDM,
        HocKy.HienThi_TKB,
        HocKy.ThayDoiHinhThucThanhToan_CQ,
        HocKy.ThayDoiHinhThucThanhToan_VLVH,
        HocKy.ThayDoiHinhThucThanhToan_SDH,
        HocKy.ThayDoiHinhThucThanhToan_DTTX,
        HocKy.ThayDoiHinhThucThanhToan_Chuyen,
        HocKy.ThayDoiHinhThucThanhToan_THCS,
        HocKy.ThayDoiHinhThucThanhToan_Khac
    ).order_by(HocKy.MaHocKy.desc()).all()

    results = []
    for row in query:
        row_dict = row._mapping
        results.append(HocKyResponse(**row_dict))
    
    return results
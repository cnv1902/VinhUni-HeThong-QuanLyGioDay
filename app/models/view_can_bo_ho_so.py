from sqlalchemy import (
    Column,
    Integer,
    BigInteger,
    SmallInteger,
    Float,
    NVARCHAR,
    Text,
    LargeBinary,
)
from app.models.base import Base


class ViewCanBoHoSo(Base):
    __tablename__ = "view_CANBO_HoSo"

    # Khóa chính định danh cho SQLAlchemy khi làm việc với View
    HS_ID = Column(BigInteger, primary_key=True, nullable=False, index=True)

    HS_Ho = Column(NVARCHAR(30), nullable=False)
    HS_Ten = Column(NVARCHAR(10), nullable=False)
    DV_ID_GiangDay = Column(NVARCHAR(20), nullable=True)
    CD_ID = Column(Integer, nullable=True)
    CD_Ten = Column(NVARCHAR(30), nullable=True)
    TDCM_ID = Column(Integer, nullable=True)
    TDCM_Ten = Column(NVARCHAR(30), nullable=True)
    CV_ID = Column(Integer, nullable=True)
    CV_Ten = Column(NVARCHAR(150), nullable=True)
    DV_Ten = Column(NVARCHAR(200), nullable=True)
    DV_Cap = Column(SmallInteger, nullable=True)
    DV_ParentID = Column(NVARCHAR(20), nullable=True)
    HS_LUONG_HeSoHienTai = Column(Float, nullable=True)
    HS_DienThoai_DiDong = Column(NVARCHAR(20), nullable=True)
    HS_TruyCap_TenDangNhap_Tam = Column(NVARCHAR(30), nullable=True)
    HS_TruyCap_TenDangNhap = Column(NVARCHAR(30), nullable=True)
    HS_POPUP_HienThi = Column(Integer, nullable=True)
    HS_Anh = Column(LargeBinary, nullable=True)
    HS_TruyCap_MatKhau = Column(NVARCHAR(50), nullable=True)
    HS_TruyCap_MatKhau_Khoa = Column(Integer, nullable=True)
    HS_NgaySinh_Ngay = Column(NVARCHAR(2), nullable=True)
    HS_NgaySinh_Thang = Column(NVARCHAR(2), nullable=True)
    HS_NgaySinh_Nam = Column(NVARCHAR(4), nullable=True)
    HS_GioiTinh = Column(SmallInteger, nullable=True)
    DV_ID_BienChe = Column(NVARCHAR(20), nullable=True)
    ThuPhieuCMC = Column(NVARCHAR(200), nullable=True)
    TTCB_ID = Column(SmallInteger, nullable=True)
    HH_ID = Column(Integer, nullable=True)
    HH_Ten = Column(NVARCHAR(50), nullable=True)
    HH_ThuTu = Column(Integer, nullable=True)
    HH_Ten_E = Column(NVARCHAR(50), nullable=True)
    CD_Ten_TiengAnh = Column(NVARCHAR(30), nullable=True)
    CV_Ten_TiengAnh = Column(NVARCHAR(30), nullable=True)
    DV_TenE = Column(NVARCHAR(100), nullable=True)
    TDCM_Ten_E = Column(NVARCHAR(30), nullable=True)
    HS_Email = Column(NVARCHAR(50), nullable=True)
    HS_ThongTinGiangDay = Column(Text, nullable=True)
    HS_ThongTinGiangDay_TiengAnh = Column(Text, nullable=True)
    HS_HuongNghienCuu = Column(Text, nullable=True)
    HS_HuongNghienCuu_TiengAnh = Column(Text, nullable=True)
    CVCanBo_CongBo = Column(Integer, nullable=True)
    CVTruong_CongBo = Column(Integer, nullable=True)
    TDCM_VietTat = Column(NVARCHAR(30), nullable=True)
    TDCM_VietTat_E = Column(NVARCHAR(30), nullable=True)
    HS_ID_CMC = Column(NVARCHAR(50), nullable=True)
    Email_VinhUni = Column(NVARCHAR(100), nullable=True)
    LHD_ID = Column(Integer, nullable=True)
    NL_ID = Column(NVARCHAR(10), nullable=True)

    @property
    def ho_ten(self) -> str:
        ho = self.HS_Ho or ""
        ten = self.HS_Ten or ""
        return f"{ho} {ten}".strip()
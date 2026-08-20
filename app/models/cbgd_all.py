from sqlalchemy import Column, Integer, String, BigInteger, SmallInteger, Float, DateTime, NVARCHAR, VARCHAR, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base
from app.models.don_vi import DonVi

class CbgdAll(Base):
    __tablename__ = "tbl_CBGD_All"

    MaCB = Column(VARCHAR(8000), nullable=True)
    HS_ID = Column(BigInteger, primary_key=True, index=True)
    HoCB = Column(NVARCHAR(30), nullable=False)
    TenCB = Column(NVARCHAR(10), nullable=False)
    NgaySinh = Column(NVARCHAR(10), nullable=True)
    MaDonVi = Column(NVARCHAR(20), ForeignKey('tbl_DonVi.MaDonVi'), nullable=True)
    DienThoai = Column(NVARCHAR(20), nullable=True)
    MatKhau = Column(NVARCHAR(50), nullable=True)
    TrangThai = Column(SmallInteger, nullable=True)
    GhiChu = Column(NVARCHAR(200), nullable=True)
    ID = Column(BigInteger, nullable=False)
    NgayVeTruong = Column(DateTime, nullable=True)
    MaChucVu = Column(Integer, nullable=True)
    CD_ID = Column(Integer, nullable=True)
    HS_LUONG_HeSoHienTai = Column(Float, nullable=True)
    HS_TenDangNhap = Column(NVARCHAR(30), nullable=True)
    DANG_ID = Column(Integer, nullable=True)
    CDOAN_ID = Column(Integer, nullable=True)
    DOAN_ID = Column(Integer, nullable=True)
    NL_ID = Column(NVARCHAR(10), nullable=True)
    HS_ID2 = Column(BigInteger, nullable=False)
    HS_NganHang_SoTaiKhoan = Column(NVARCHAR(20), nullable=True)
    HS_CV_HeSo = Column(Float, nullable=True)
    DonViCongTac = Column(NVARCHAR(20), nullable=True)
    TDCM_ID = Column(Integer, nullable=True)
    HS_NganHang_TenChiNhanh = Column(NVARCHAR(50), nullable=True)
    Email_VinhUni = Column(NVARCHAR(100), nullable=True)
    
    # Mối quan hệ logic (hoạt động kể cả với View)
    don_vi = relationship("DonVi", backref="ds_can_bo")

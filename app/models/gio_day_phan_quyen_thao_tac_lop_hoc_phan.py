from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class GioDayPhanQuyenThaoTacLopHocPhan(Base):
    __tablename__ = "tbl_GIODAY_PhanQuyen_ThaoTacLopHocPhan"

    HeDaoTao_ID = Column(Integer, primary_key=True, nullable=False)
    HS_ID = Column(BigInteger, primary_key=True, nullable=False)
    QuyenCapNhat = Column(Boolean, default=False, nullable=True)
    QuyenXacNhan = Column(Boolean, default=False, nullable=True)
    QuyenLapDanhSach = Column(Boolean, default=False, nullable=True)
    QuyenKyXacNhan = Column(Boolean, default=False, nullable=True)
    LoaiPhamViXacNhan = Column(String(50), nullable=True)
    PhamViXacNhan = Column(String(100), nullable=True)
    HieuLuc = Column(Integer, default=1, nullable=True)
    ThoiGianPhanQuyen = Column(DateTime, default=func.now(), nullable=True)
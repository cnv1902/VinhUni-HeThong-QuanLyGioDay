from sqlalchemy import Column, Integer, BigInteger, NVARCHAR, Boolean
from app.models.base import Base

class ViewHeThongPhanQuyenChucNang(Base):
    __tablename__ = "view_HETHONG_PHANQUYEN_ChucNang"

    # Khai báo primary_key=True cho các cột không null để SQLAlchemy hoạt động được với View
    HS_ID = Column(BigInteger, primary_key=True, nullable=False)
    CN_ID = Column(Integer, primary_key=True, nullable=False)
    NHOM_ID = Column(Integer, primary_key=True, nullable=False)
    
    CN_Ten = Column(NVARCHAR(100), nullable=True)
    CN_Thuoc = Column(Integer, nullable=True)
    CN_ThuTu = Column(Integer, nullable=True)
    CN_Cap = Column(Integer, nullable=True)
    CN_HienThi = Column(Boolean, nullable=True)
    CN_TrangThai = Column(Integer, nullable=True)
    ThuocMoDul = Column(NVARCHAR(50), nullable=True)
    CN_URL = Column(NVARCHAR(255), nullable=True)
from sqlalchemy import Column, Integer, NVARCHAR, Boolean
from app.models.base import Base

class HeThongChucNang(Base):
    __tablename__ = "tbl_HETHONG_ChucNang"

    CN_ID = Column(Integer, primary_key=True, autoincrement=False, nullable=False)
    CN_Ten = Column(NVARCHAR(100), nullable=True)
    CN_DienGiai = Column(NVARCHAR(255), nullable=True)
    CN_Thuoc = Column(Integer, nullable=True)
    CN_ThuTu = Column(Integer, nullable=True)
    CN_Cap = Column(Integer, nullable=True)
    CN_Loai = Column(Integer, nullable=True)
    CN_URL = Column(NVARCHAR(255), nullable=True)
    CN_Logo = Column(NVARCHAR(255), nullable=True)
    CN_HienThi = Column(Boolean, nullable=True)
    CN_TrangThai = Column(Integer, nullable=True)
    CN_MauNen = Column(NVARCHAR(50), nullable=True)
    Mobile_Url = Column(NVARCHAR(250), nullable=True)
    Mobile_Logo = Column(NVARCHAR(150), nullable=True)
    Mobile_MauNen = Column(NVARCHAR(10), nullable=True)
    Mobile_TrangChu = Column(Integer, nullable=True, default=0)
    Mobile_NhomID = Column(Integer, nullable=True, default=0)
    Mobile_ThuTu = Column(Integer, nullable=True, default=0)
    Mobile_Ten = Column(NVARCHAR(100), nullable=True)
    Mobile_View = Column(NVARCHAR(50), nullable=True)
    Mobile_Controler = Column(NVARCHAR(50), nullable=True)
    CN_Logo_Cu = Column(NVARCHAR(255), nullable=True)
    Mobile_Url_Cu = Column(NVARCHAR(250), nullable=True)
    Mobile_Logo_Cu = Column(NVARCHAR(150), nullable=True)
    ThuocMoDul = Column(NVARCHAR(50), nullable=True)
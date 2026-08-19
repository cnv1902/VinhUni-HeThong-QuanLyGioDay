from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, BigInteger, text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class CQKeKhai(Base):
    __tablename__ = "tbl_CQ_KeKhai"

    ID_KeKhaiCQ = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    HS_ID = Column(BigInteger, nullable=True)
    MaCB = Column(String(20), nullable=True)
    MaNhomLopHP = Column(String(50), ForeignKey("tbl_CQ_NhomLopHocPhan.MaNhomLopHP"), nullable=False)
    NgayKeKhai = Column(String(50), nullable=True)
    MaHocKy = Column(Integer, nullable=True)
    SoTietLTKK = Column(Float, nullable=True, server_default=text("((0))"))
    SoTietTHKK = Column(Float, nullable=True, server_default=text("((0))"))
    SoTietBTKK = Column(Float, nullable=True, server_default=text("((0))"))
    TuNgay1 = Column(String(10), nullable=True)
    DenNgay1 = Column(String(10), nullable=True)
    TuNgay2 = Column(String(10), nullable=True)
    DenNgay2 = Column(String(10), nullable=True)
    TuNgay3 = Column(String(10), nullable=True)
    DenNgay3 = Column(String(10), nullable=True)
    Thu_Tiet1 = Column(String(100), nullable=True)
    Thu_Tiet2 = Column(String(100), nullable=True)
    Thu_Tiet3 = Column(String(100), nullable=True)
    NghiDay = Column(String(300), nullable=True)
    DayBu = Column(String(300), nullable=True)
    DayThay = Column(String(300), nullable=True)
    TimeLine = Column(String(2000), nullable=True)
    ThucHien = Column(Integer, nullable=True, server_default=text("((0))"))
    XacNhan = Column(Boolean, nullable=True)
    GhiChu = Column(String(500), nullable=True)
    XacNhanThanhToan = Column(Boolean, nullable=True, server_default=text("((0))"))
    ThoiGianKeKhai = Column(DateTime, nullable=True, server_default=text("(getdate())"))
    XacNhan_Nguoi = Column(BigInteger, nullable=True)
    XacNhan_ThoiGian = Column(DateTime, nullable=True)
    XacNhanThanhToan_Nguoi = Column(BigInteger, nullable=True)
    XacNhanThanhToan_ThoiGian = Column(DateTime, nullable=True)
    NguoiKeKhai = Column(BigInteger, nullable=True, server_default=text("((0))"))
    LoaiThanhToan = Column(Integer, nullable=True, server_default=text("((0))"))
    ChuyenXacNhan = Column(Integer, nullable=True, server_default=text("((0))"))
    HinhThucThanhToan = Column(Integer, nullable=True, server_default=text("((1))"))
    DaPhanKhai = Column(Integer, nullable=True, server_default=text("((0))"))
    Lan = Column(Integer, nullable=True)

    # Relationships
    NhomLopHocPhan = relationship("CQNhomLopHocPhan", back_populates="DSKeKhai")


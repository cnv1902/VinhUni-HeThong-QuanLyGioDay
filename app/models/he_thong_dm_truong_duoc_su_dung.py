import enum
from sqlalchemy import Column, String, Integer, Boolean, Enum
from app.models.base import Base

# 1. Định nghĩa trước các tập hợp được phép chọn (Từ điển)
class CanLeEnum(str, enum.Enum):
    LEFT = "left"
    CENTER = "center"
    RIGHT = "right"

class KieuTruongEnum(str, enum.Enum):
    TEXT = "text"
    NUMBER = "number"
    SELECT = "select"
    BADGE = "badge"
    CAPACITY = "capacity"
    ACTION = "action"
    MONO = "mono"

class DMTruongSuDung(Base):
    __tablename__ = "tbl_HETHONG_DMTruongDuocSuDung"

    ID = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    TenBang = Column(String(50), nullable=False)
    MaTruong = Column(String(50), nullable=False)
    TenTruong = Column(String(100), nullable=False) 
    DoRong = Column(Integer, default=100)
    ThuTuHienThi = Column(Integer, default=0)
    HienThi = Column(Boolean, default=True)
    DuocSua = Column(Boolean, default=False)
    GhimCot = Column(Boolean, default=False)

    # 2. Các cột này sử dụng String vì trong DB là VARCHAR + CHECK constraint
    CanLe = Column(String(20), default=CanLeEnum.LEFT.value)
    KieuTruong = Column(String(50), default=KieuTruongEnum.TEXT.value)

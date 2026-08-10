from pydantic import BaseModel, ConfigDict
from typing import Optional

class NhomCongThucBase(BaseModel):
    ID_He: int
    TenNhomCongThuc: str
    TuMaHocKy: int
    DenMaHocKy: Optional[int] = None
    GhiChu_DieuKien: Optional[str] = None
    TrangThai: Optional[bool] = True

class NhomCongThucCreate(NhomCongThucBase):
    DsMaHTHoc: str # Chuỗi danh sách hình thức học từ giao diện (VD: ",1,12,")

class NhomCongThucUpdate(NhomCongThucBase):
    DsMaHTHoc: Optional[str] = None
    ID_He: Optional[int] = None
    TenNhomCongThuc: Optional[str] = None
    TuMaHocKy: Optional[int] = None

class NhomCongThucResponse(NhomCongThucBase):
    ID_Nhom_CT: int
    DsMaHTHoc: str
    
    # Các trường mở rộng để hiển thị tên thay vì ID
    Ten_HeDaoTao: Optional[str] = None
    TuHocKy_Ten: Optional[str] = None
    DenHocKy_Ten: Optional[str] = None
    Ds_TenHTHoc: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

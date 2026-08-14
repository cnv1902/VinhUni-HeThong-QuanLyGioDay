from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from app.core.config import settings
import time

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

# Lưu lại thời điểm server khởi động để làm version
# Giúp trình duyệt cache file tĩnh trọn đời, chỉ tải lại khi server restart (có bản cập nhật mới)
STARTUP_TIME = str(int(time.time()))
templates.env.globals["API_PREFIX"] = settings.API_V1_STR  # type: ignore
templates.env.globals["CACHE_BUSTER"] = lambda: STARTUP_TIME  # type: ignore

@router.get("/", include_in_schema=False)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/index.html"
    )

@router.get("/he_dao_tao_chinh_quy.html", include_in_schema=False)
async def he_dao_tao_chinh_quy(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/he_dao_tao_chinh_quy.html"
    )

@router.get("/quan_ly_nhom_lop_hoc_phan.html", include_in_schema=False)
async def quan_ly_nhom_lop(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/quan_ly_nhom_lop_hoc_phan.html"
    )

@router.get("/login", include_in_schema=False)
async def login_page(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/login.html"
    )

@router.get("/nhom_cong_thuc_quy_doi.html", include_in_schema=False)
async def cong_thuc_quy_doi(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/nhom_cong_thuc_quy_doi.html"
    )

@router.get("/ca-nhan.html", include_in_schema=False)
async def ca_nhan(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan.html"
    )

@router.get("/ca-nhan-1.html", include_in_schema=False)
async def ca_nhan_1(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan_1.html"
    )

@router.get("/ca-nhan-2.html", include_in_schema=False)
async def ca_nhan_2(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan_2.html"
    )

@router.get("/ca-nhan-3.html", include_in_schema=False)
async def ca_nhan_3(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan_3.html"
    )

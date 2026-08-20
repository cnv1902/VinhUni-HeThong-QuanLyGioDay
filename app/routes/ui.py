from fastapi.responses import RedirectResponse, FileResponse
from fastapi.templating import Jinja2Templates
from app.core.exceptions import CredentialsException, PermissionDeniedException
from app.api.dependencies import get_current_hs_id
from fastapi import APIRouter, Request, Depends
from app.core.config import settings
import time
import json
import os

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

# Lưu lại thời điểm server khởi động để làm version
# Giúp trình duyệt cache file tĩnh trọn đời, chỉ tải lại khi server restart (có bản cập nhật mới)
STARTUP_TIME = str(int(time.time()))
templates.env.globals["API_PREFIX"] = settings.API_V1_STR  # type: ignore
templates.env.globals["CACHE_BUSTER"] = lambda: STARTUP_TIME  # type: ignore

@router.get("/", include_in_schema=False)
async def index(request: Request, hs_id: int = Depends(get_current_hs_id)):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/index.html"
    )

@router.get("/he_dao_tao_chinh_quy.html", include_in_schema=False)
async def he_dao_tao_chinh_quy(request: Request, hs_id: int = Depends(get_current_hs_id)):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/he_dao_tao_chinh_quy.html"
    )

@router.get("/quan_ly_nhom_lop_hoc_phan.html", include_in_schema=False)
async def quan_ly_nhom_lop(request: Request, hs_id: int = Depends(get_current_hs_id)):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/quan_ly_nhom_lop_hoc_phan.html"
    )

@router.get("/danh_muc_truong_duoc_su_dung.html", include_in_schema=False)
async def danh_muc_truong_duoc_su_dung(request: Request, hs_id: int = Depends(get_current_hs_id)):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/danh_muc_truong_duoc_su_dung.html"
    )

@router.get("/login", include_in_schema=False)
async def login_page(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/login.html"
    )

@router.get("/logout", include_in_schema=False)
async def logout_page():
    response = RedirectResponse(url="/login")
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return response

@router.get("/no-access", include_in_schema=False)
async def no_access_page(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/errors/no_access.html"
    )

@router.get("/nhom_cong_thuc_quy_doi.html", include_in_schema=False)
async def cong_thuc_quy_doi(request: Request, hs_id: int = Depends(get_current_hs_id)):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/nhom_cong_thuc_quy_doi.html"
    )

@router.get("/phan_quyen_xac_nhan.html", include_in_schema=False)
async def phan_quyen_xac_nhan(request: Request, hs_id: int = Depends(get_current_hs_id)):
    return templates.TemplateResponse(
        request=request,
        name="pages/admin/phan-quyen-xac-nhan.html"
    )

@router.get("/notes", include_in_schema=False)
async def notes_page():
    return FileResponse("tests/notes.html")

@router.api_route("/notes.json", methods=["GET", "POST"], include_in_schema=False)
async def handle_notes_json(request: Request):
    if request.method == "POST":
        with open("tests/notes.json", "w", encoding="utf-8") as f:
            json.dump(await request.json(), f, ensure_ascii=False, indent=2)
        return {"status": "success"}
    return FileResponse("tests/notes.json", media_type="application/json")

# Hàm xử lý giao diện lỗi 404 chung cho toàn hệ thống
# (Lưu ý: Hàm này cần được đăng ký với app = FastAPI() bằng app.add_exception_handler)
async def not_found_exception_handler(request: Request, exc: Exception):
    return templates.TemplateResponse(
        request=request,
        name="pages/errors/404-notfound.html",
        status_code=404
    )

async def unauth_exception_handler(request: Request, exc: Exception):
    if request.url.path.startswith("/api/"):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=401,
            content={"detail": "Token không hợp lệ hoặc đã hết hạn"},
        )
    return RedirectResponse(url="/login")

async def forbidden_exception_handler(request: Request, exc: Exception):
    if request.url.path.startswith("/api/"):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=403,
            content={"detail": "Không có quyền thực hiện chức năng này"},
        )
    return templates.TemplateResponse(
        request=request,
        name="pages/errors/no_access.html",
        status_code=403
    )
from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/", include_in_schema=False)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/index.html"
    )

@router.get("/quan_ly_nhom_lop_hoc_phan.html", include_in_schema=False)
async def quan_ly_nhom_lop(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/quan_ly_nhom_lop_hoc_phan.html"
    )

@router.get("/login", include_in_schema=False)
async def login_page(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/login.html"
    )

from pathlib import Path
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics

BASE = Path(__file__).resolve().parent
STATIC, TEMPLATES, PDF_DIR = BASE / "static", BASE / "templates", BASE / "generated"
STATIC.mkdir(exist_ok=True)
PDF_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Test ký số VinhUni")
app.mount("/static", StaticFiles(directory=STATIC), name="static")
templates = Jinja2Templates(directory=TEMPLATES)

font = Path("C:/Windows/Fonts/arial.ttf")
if font.exists():
    pdfmetrics.registerFont(TTFont("Arial", str(font)))
    PDF_FONT = "Arial"
else:
    PDF_FONT = "Helvetica"

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# ─────────────────────────────────────────────────────────────────────────────
#  KHÔNG lấy vé đăng nhập ở phía máy chủ nữa. Toàn bộ khối MSAL và endpoint
#  /api/lay-token-ky đã được BỎ, có chủ đích:
#
#  1. msal.PublicClientApplication + acquire_token_interactive() là luồng dành cho ứng dụng
#     DESKTOP. Nó mở trình duyệt trên chính máy đang chạy tiến trình Python, và dựng một cổng
#     nghe tạm ở http://localhost:<cổng ngẫu nhiên> để nhận mã trả về — đó chính là "localhost
#     cổng khác, không phải 4000" mà các anh thấy. Trên máy dev thì máy chủ và trình duyệt là
#     một nên nó gần như chạy được; đưa lên máy chủ thật thì trình duyệt sẽ bật lên TRÊN MÁY
#     CHỦ, không ai nhìn thấy để bấm.
#
#  2. Bộ nhớ đệm vé của msal_app nằm trong tiến trình và DÙNG CHUNG cho mọi người gọi.
#     get_accounts() không lọc sẽ trả về người đăng nhập gần nhất — nghĩa là ai gọi
#     /api/lay-token-ky cũng nhận được vé của người khác, và mọi chữ ký đổ về một người.
#     Đây là điều hệ thống ký số phải chặn tuyệt đối.
#
#  3. Endpoint đó không hề xác thực người gọi: ai vào được máy chủ là lấy được vé.
#
#  Vé phải lấy Ở TRÌNH DUYỆT, bằng @azure/msal-browser, dưới danh nghĩa chính người đang ngồi
#  ký — xem templates/index.html. Máy chủ này chỉ còn việc sinh PDF.
# ─────────────────────────────────────────────────────────────────────────────


@app.post("/api/xuat-pdf")
async def xuat_pdf():
    filename = f"van-ban-test-{datetime.now():%Y%m%d-%H%M%S}.pdf"
    path = PDF_DIR / filename
    c = canvas.Canvas(str(path), pagesize=A4)
    w, h = A4

    c.setFont(PDF_FONT, 18)
    c.drawCentredString(w / 2, h - 80, "VĂN BẢN TEST KÝ SỐ")

    rows = [
        ("Số văn bản", "TEST-KYSO-001"),
        ("Ngày lập", datetime.now().strftime("%d/%m/%Y %H:%M")),
        ("Đơn vị", "Trường Đại học Vinh"),
        ("Người lập", "Người dùng kiểm thử"),
        ("Nội dung", "Đây là văn bản mẫu dùng để kiểm thử quy trình ký số."),
    ]

    y = h - 135
    for label, value in rows:
        c.setFont(PDF_FONT, 11)
        c.drawString(70, y, f"{label}:")
        c.drawString(180, y, value)
        y -= 30

    c.drawString(70, y - 10, "Xác nhận:")
    c.rect(70, y - 150, 450, 120)
    c.setFont(PDF_FONT, 9)
    c.drawString(70, 55, "PDF được sinh bởi ứng dụng test ký số FastAPI.")
    c.save()

    return {"success": True, "fileName": filename, "url": f"/api/pdf/{filename}"}


@app.get("/api/pdf/{filename}")
async def get_pdf(filename: str):
    path = PDF_DIR / Path(filename).name
    if not path.exists():
        return {"success": False, "message": "Không tìm thấy PDF"}
    return FileResponse(path, media_type="application/pdf", filename=path.name)
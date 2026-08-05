# Backend Architecture & Coding Guidelines (FastAPI)

When instructed to write or modify backend logic for this project, you MUST strictly adhere to the layered architecture (Domain-Driven Design) described below. **Do not mix concerns** by writing queries directly in route handlers or putting validation inside ORM models.

## 1. Directory Structure & Responsibilities

- **`app/models/` (SQLAlchemy ORM Models)**
  - Chứa định nghĩa cấu trúc bảng CSDL (Entities). 
  - Tuyệt đối KHÔNG chứa logic nghiệp vụ hay validation request tại đây.
  - Class phải kế thừa từ `Base` (`from app.models.base import Base`).
  
- **`app/schemas/` (Pydantic Models)**
  - Chứa các class DTO (Data Transfer Objects) phục vụ kiểm tra/validate dữ liệu đầu vào (Request) và định dạng dữ liệu đầu ra (Response).
  - Khuyến nghị chia thành các class như `ItemBase`, `ItemCreate`, `ItemUpdate`, `ItemResponse`.

- **`app/crud/` (Database Operations - C.R.U.D)**
  - Chỉ chứa logic truy vấn cơ sở dữ liệu bằng SQLAlchemy (Create, Read, Update, Delete).
  - Tên file thường là `crud_[tên_đối_tượng].py` hoặc `[tên_đối_tượng].py`.
  - Các hàm luôn phải nhận `db: Session` làm tham số đầu tiên. Ví dụ: `def get_item(db: Session, item_id: int)`.
  - **KHÔNG** throw lỗi HTTP (`HTTPException`) tại đây. Chỉ trả về dữ liệu hoặc `None`.

- **`app/api/v1/endpoints/` (REST API Routers)**
  - Chứa các endpoint API trả về dữ liệu JSON (`@router.get()`, `@router.post()`).
  - Chịu trách nhiệm nhận request, gọi hàm từ thư mục `crud` hoặc `services`, xử lý lỗi (throw `HTTPException` nếu CRUD trả về None) và trả về Pydantic schema.
  - **NGHIÊM CẤM** viết các dòng code truy vấn SQLAlchemy trực tiếp bên trong endpoint.

- **`app/routes/` (UI/HTML Routers)**
  - Chứa các router trả về giao diện HTML qua Jinja2 (`TemplateResponse`) (ví dụ: `ui.py`).

- **`app/services/` (Business Logic & Caching)**
  - Chứa các nghiệp vụ phức tạp đòi hỏi gọi nhiều hàm CRUD liên tiếp, hoặc gọi ra API bên ngoài.
  - **Quy tắc Caching (Redis):** Khi viết logic xử lý bộ nhớ đệm (Cache) bằng Redis trong Service, BẮT BUỘC tuân thủ 2 nguyên tắc sau:
    1. Phải khai báo biến `CACHE_PREFIX` ở ngay đầu file (Ví dụ: `CACHE_PREFIX = "cache:hoc_ky:"`). Nếu API có tham số, phải nối chuỗi tạo Khóa Động (Dynamic Key) (Ví dụ: `f"{CACHE_PREFIX}{ma_hoc_ky}"`). Tuyệt đối không dùng Khóa Tĩnh (Static Key) cho dữ liệu động.
    2. Bất kỳ lệnh nào tương tác với Redis (`redis_client.get`, `setex`, `delete`) BẮT BUỘC phải được bọc trong khối `try...except Exception as e:` và in ra log lỗi bằng `logger.error` (chống sập API). Nếu Redis hỏng, hàm bắt buộc phải trôi tuột xuống phần dưới để gọi DB bình thường (Graceful Degradation).
    3. Tuyệt đối KHÔNG sử dụng `logger.info` để ghi log thành công (Ví dụ: Cache HIT, DB HIT) hay log thời gian thực thi trong tầng Service vì sẽ gây rác file log (noise). Chỉ ghi log ở mức độ ERROR.

## 2. Quy trình viết mã Backend (Implementation Workflow)
Mỗi khi nhận yêu cầu làm một chức năng Backend mới, bạn phải tuân thủ luồng sau:
1. **Model:** Khai báo cấu trúc bảng trong `app/models/`.
2. **Schema:** Viết các class validate Pydantic trong `app/schemas/`.
3. **CRUD:** Viết các hàm thao tác DB trong `app/crud/`.
4. **Router/API:** Khai báo endpoint trong `app/api/v1/endpoints/` (JSON) hoặc `app/routes/` (HTML), gọi hàm từ CRUD/Service và import Pydantic Schema để format dữ liệu.

## 3. Các quy tắc Import
- Luôn sử dụng Absolute Import bắt đầu bằng `app.` (VD: `from app.models.user import User` thay vì `from ..models.user import User`).

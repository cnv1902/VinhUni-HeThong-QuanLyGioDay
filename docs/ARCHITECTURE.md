# Cấu trúc Thư mục Dự án (Project Directory Structure)

Dưới đây là sơ đồ cấu trúc các thư mục quan trọng cấu thành nên dự án VinhUni - Hệ thống Quản lý Giờ dạy, cùng với giải thích ngắn gọn về chức năng của từng phần. 

---

## 1. Sơ đồ Cây thư mục (Project Tree)

```text
VinhUni-HeThong-QuanLyGioDay/
├── app/                      # Mã nguồn Backend (FastAPI)
│   ├── api/                  
│   ├── core/                 
│   ├── crud/                 
│   ├── db/                   
│   ├── models/               
│   ├── routes/               
│   ├── schemas/              
│   ├── services/             
│   ├── templates/            
│   └── utils/                
├── docs/                     # Tài liệu của dự án
└── static/                   # Tài nguyên Frontend (CSS, JS, Images)
    ├── css/                  
    ├── images/               
    └── js/                   
        ├── api/              
        ├── components/       
        ├── core/             
        └── pages/            
```

---

## 2. Giải thích Chức năng Thư mục

### Thư mục Backend (`app/`)
Đây là khu vực chứa toàn bộ mã nguồn xử lý logic ở phía Server được viết bằng Python (FastAPI).

* **`app/api/`**: Chứa các file định tuyến (Routers/Endpoints). Nơi này chỉ làm nhiệm vụ tiếp nhận HTTP Request từ client và trả về HTTP Response.
* **`app/core/`**: Chứa các cấu hình cốt lõi của hệ thống như biến môi trường (Config), thiết lập bảo mật (Security), Middleware, và cấu hình kết nối Redis.
* **`app/crud/`**: (Create, Read, Update, Delete) Chứa các hàm trực tiếp giao tiếp với Cơ sở dữ liệu thông qua SQLAlchemy (Data Access Layer). Tầng này thao tác truy vấn thô và không chứa logic nghiệp vụ.
* **`app/db/`**: Chứa cấu hình quản lý phiên kết nối (Session) với CSDL SQL Server.
* **`app/models/`**: Chứa các Class khai báo cấu trúc các bảng (Tables) trong Database dưới dạng ORM (Object-Relational Mapping).
* **`app/routes/`**: Chứa các router dành riêng cho việc trả về trực tiếp giao diện HTML (thay vì trả về dữ liệu JSON như `api/`).
* **`app/schemas/`**: Chứa các file định nghĩa cấu trúc dữ liệu đầu vào và đầu ra (Pydantic Models) để hệ thống tự động kiểm tra tính hợp lệ của dữ liệu.
* **`app/services/`**: Trái tim của hệ thống. Chứa toàn bộ các xử lý logic nghiệp vụ, thuật toán tính toán giờ dạy, kiểm tra ràng buộc. Các hàm ở đây sẽ gọi đến `crud/` để thao tác với DB.
* **`app/templates/`**: Chứa các file giao diện HTML thô (sử dụng template engine Jinja2) để server gửi về cho trình duyệt.
* **`app/utils/`**: Nơi chứa các module tiện ích nhỏ, dùng chung và độc lập (như hàm xử lý chuỗi, trình biên dịch công thức toán học).

### Thư mục Frontend (`static/`)
Đây là khu vực chứa tài nguyên giao diện được client tải về và chạy trên trình duyệt (Vanilla JS, CSS thuần).

* **`static/css/`**: Chứa các file style định dạng màu sắc, bố cục cho giao diện.
* **`static/images/`**: Chứa tài nguyên hình ảnh, logo, background.
* **`static/js/`**: Chứa toàn bộ logic kịch bản xử lý ở phía trình duyệt (Client-side).
  * **`static/js/api/`**: Chứa các hàm đóng gói (Wrapper) dùng lệnh `fetch` để gọi API lên backend.
  * **`static/js/components/`**: Chứa các phần tử giao diện (UI Components) tự thiết kế có thể tái sử dụng ở nhiều trang (như DataTable, Modal, ComboBox, Sidebar).
  * **`static/js/core/`**: Chứa các tiện ích, hằng số cấu hình toàn cục và bộ quản lý Cache của Frontend.
  * **`static/js/pages/`**: Nơi gộp các Component và API lại với nhau để tạo thành logic xử lý riêng biệt cho từng trang màn hình cụ thể (Ví dụ: trang Quản lý Danh mục, trang Đăng nhập).

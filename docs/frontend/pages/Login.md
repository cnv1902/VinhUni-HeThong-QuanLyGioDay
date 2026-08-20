# Tài liệu Page JS: Login

**Đường dẫn:** `static/js/pages/login.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Script điều khiển trang Đăng nhập (`/login`). Chạy trong `DOMContentLoaded`. Không export gì ra ngoài.

---

## 1. Tham số khởi tạo (Inputs)

Không có tham số. Đọc DOM các phần tử bằng ID cố định:

| ID phần tử | Mô tả |
|---|---|
| `#loginForm` | Form đăng nhập chính |
| `#btnTogglePassword` | Nút ẩn/hiện mật khẩu |
| `#password` | Input mật khẩu |
| `#username` | Input tên đăng nhập |
| `#rememberMe` | Checkbox "Ghi nhớ đăng nhập" |
| `#btnWorkMail` | Nút "Đăng nhập bằng Mail Công Việc" |
| `.forgot-link` | Link "Quên mật khẩu" |

---

## 2. Phụ thuộc (Dependencies)

- `showToast(msg)` (global function từ `static/js/components/toast.js`) — được gọi có điều kiện `typeof showToast === 'function'`. Nếu chưa load, fallback sang `alert()`.

---

## 3. Quá trình xử lý (Process & Side-effects)

### Nút Toggle Password
Đổi `type` attribute của `#password` giữa `'password'` và `'text'`. Cập nhật innerHTML SVG icon tương ứng (eye / eye-off).

### Submit Form (`#loginForm`)
1. Lấy giá trị `username`, `password`, `remember` từ DOM.
2. Validate: nếu thiếu username hoặc password → gọi `showToast(...)`.
3. Nếu hợp lệ: gọi `showToast('Đăng nhập thành công...')`, sau 1000ms redirect về `/quan_ly_nhom_lop_hoc_phan.html` bằng `window.location.href`.

> ⚠️ **[UNDOCUMENTED_SIDE_EFFECT] (Severity: MINOR):** Logic xác thực hiện tại là **giả lập** (mock) — không gọi API backend thực. Khi tích hợp SSO thật (qua Cổng Cán Bộ), phần submit form này sẽ cần thay hoặc xóa bỏ.

### Quên mật khẩu (`.forgot-link`)
Gọi `showToast('Chức năng đang được xây dựng.')` — không có logic thực.

### Đăng nhập bằng Mail Công Việc (`#btnWorkMail`)
Gọi `showToast('Đang chuyển hướng sang cổng xác thực...')` — không redirect thực.

---

## 4. Kết quả đầu ra (Output)

Không trả về giá trị. Side-effects chính:
- Thay đổi `type` attribute của input password.
- Redirect `window.location.href` sau 1 giây khi đăng nhập thành công (mock).

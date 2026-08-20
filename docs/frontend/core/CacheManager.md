# Tài liệu Core: CacheManager

**Đường dẫn:** `static/js/core/cache_manager.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

IIFE (Immediately Invoked Function Expression) — Chạy tự động ngay khi script được load, không export function/class nào ra ngoài.

---

## 1. Tham số khởi tạo (Inputs)

Không có tham số. Đọc dữ liệu từ môi trường toàn cục:

- `window.APP_VERSION` (string) — Phiên bản hiện tại của ứng dụng, được inject từ Jinja2 template (`base.html`) trước khi script này load.

---

## 2. Phụ thuộc (Dependencies)

- `window.APP_VERSION` — Inject bởi Jinja2, **bắt buộc phải có trước** khi script này chạy.
- `localStorage` (Web API built-in).

---

## 3. Quá trình xử lý (Process & Side-effects)

1. Kiểm tra `window.APP_VERSION` — nếu `undefined` thì dừng ngay (`return`).
2. So sánh `APP_VERSION` lưu trong `localStorage` với phiên bản hiện tại.
3. Nếu **khác nhau** (tức là server đã được cập nhật phiên bản mới):
   - Gọi `localStorage.clear()` — **xóa toàn bộ** dữ liệu LocalStorage (bao gồm trạng thái bộ lọc, cấu hình cột, sidebar state, v.v.).
   - Ghi lại phiên bản mới: `localStorage.setItem('APP_VERSION', currentVersion)`.
   - In log ra console: `[CacheManager] System updated to version: {version}. LocalStorage has been wiped...`

---

## 4. Kết quả đầu ra (Output)

Không có giá trị trả về. Side-effect duy nhất là xóa và ghi lại `localStorage`.

---

## 5. Ghi chú quan trọng

- Phải được load **trước tất cả** các script khác sử dụng `localStorage` để tránh đọc dữ liệu lỗi thời.
- `window.APP_VERSION` trong `base.html` được thiết lập là timestamp Unix khi server khởi động (`STARTUP_TIME`), không phải số phiên bản ngữ nghĩa.

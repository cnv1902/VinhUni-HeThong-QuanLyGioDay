# Tài liệu API Layer: NavbarApi

**Đường dẫn:** `static/js/api/navbarApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiNavbar` — API Layer lấy dữ liệu danh mục dùng cho Navbar (thanh tiêu đề).

---

## Danh sách phương thức (Methods)

### `apiNavbar.getNamTaiChinhList()`

| Trục | Mô tả |
|---|---|
| **[In]** | Không có tham số |
| **[Deps]** | `fetch` (Web API), `window.API_PREFIX` (chuỗi prefix URL inject từ Jinja2, VD: `/api/v1`), endpoint `GET {API_PREFIX}/nam-tai-chinh/` |
| **[Side-effect / Proc]** | Gọi mạng bất đồng bộ `GET {API_PREFIX}/nam-tai-chinh/`. Nếu `response.ok === false` ném Error. Nếu có lỗi bất kỳ, bắt bằng `try/catch` và ghi `console.error(...)`. |
| **[Out]** | `Promise<Array>` — Mảng danh sách năm tài chính. Trả về `[]` (mảng rỗng) nếu gặp lỗi mạng (không ném Error ra caller). |

---

## Ví dụ sử dụng

```javascript
// Trong navbar.js (UI Layer)
const danhSachNam = await apiNavbar.getNamTaiChinhList();
// danhSachNam là [] nếu lỗi, hoặc Array nếu thành công
```

---

## Ghi chú

- Phương thức này **nuốt lỗi** (swallows error) thay vì ném ra — caller sẽ nhận `[]` thay vì exception. Hành vi này là chủ đích để không crash Navbar khi API chưa sẵn sàng.

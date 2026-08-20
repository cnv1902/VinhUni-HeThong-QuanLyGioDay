# Tài liệu API Layer: DanhMucTruongDuocSuDungApi

**Đường dẫn:** `static/js/api/admin/danhMucTruongDuocSuDungApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiDanhMucTruongDuocSuDung` — API Layer phục vụ trang Danh mục Trường được sử dụng (cấu hình cột hiển thị bảng dữ liệu toàn hệ thống).

---

## Danh sách phương thức (Methods)

### `getColumnsConfig()`

| Trục | Mô tả |
|---|---|
| **[In]** | *(không có)* |
| **[Deps]** | `fetch`, endpoint `GET {API_PREFIX}/cau-hinh-chung/danh-sach-cot/HETHONG_DMTruongDuocSuDung` |
| **[Side-effect / Proc]** | Gọi mạng có `try/catch`. Ghi `console.error('Lỗi khi lấy cấu hình cột:', error)`. |
| **[Out]** | `Promise<Array>` — Mảng cấu hình cột. Trả `[]` nếu lỗi. |

---

### `getDanhSachBang()`

| Trục | Mô tả |
|---|---|
| **[In]** | *(không có)* |
| **[Deps]** | `fetch`, endpoint `GET {API_PREFIX}/cau-hinh-chung/danh-sach-bang` |
| **[Side-effect / Proc]** | Gọi mạng có `try/catch`. Nếu lỗi: **ném lại error** ra caller (không nuốt). |
| **[Out]** | `Promise<Array>` — Mảng danh sách bảng (MaBang). Ném `Error` nếu thất bại. |

---

### `getDanhSachCot(maBang)`

| Trục | Mô tả |
|---|---|
| **[In]** | `maBang` (string) — Mã bảng cần lấy danh sách cột, truyền `'all'` để lấy tất cả |
| **[Deps]** | `fetch`, endpoint `GET {API_PREFIX}/cau-hinh-chung/danh-sach-cot-admin/{maBang}` |
| **[Side-effect / Proc]** | Gọi mạng có `try/catch`. Ghi `console.error`. Dùng endpoint admin (lấy cả cột đang bị ẩn). |
| **[Out]** | `Promise<Array>` — Mảng cấu hình cột. Trả `[]` nếu lỗi. |

---

### `bulkUpdateDanhSachCot(payload)`

| Trục | Mô tả |
|---|---|
| **[In]** | `payload` (Array) — Mảng các cập nhật cấu hình cột |
| **[Deps]** | `fetch`, endpoint `PUT {API_PREFIX}/cau-hinh-chung/danh-sach-cot/bulk-update` |
| **[Side-effect / Proc]** | Gọi mạng PUT với JSON body. **Không có try/catch** — nếu lỗi HTTP, parse JSON lỗi và ném `Error(detail)` ra caller. |
| **[Out]** | `Promise<Object>` — Response JSON. Ném `Error` nếu thất bại. |

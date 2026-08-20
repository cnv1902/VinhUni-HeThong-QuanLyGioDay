# Tài liệu API Layer: LopHocPhanChinhQuyApi

**Đường dẫn:** `static/js/api/admin/lopHocPhanChinhQuyApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiLopHocPhanChinhQuy` — API Layer phục vụ trang Quản lý Nhóm Lớp Học Phần Chính Quy.

---

## Danh sách phương thức (Methods)

### `getColumnsConfig()`

| Trục | Mô tả |
|---|---|
| **[In]** | *(không có)* |
| **[Deps]** | `fetch`, endpoint `GET {API_PREFIX}/cau-hinh-chung/danh-sach-cot/CQ_NhomLopHocPhan` |
| **[Side-effect / Proc]** | Gọi mạng, có `try/catch`. Ghi `console.error` nếu lỗi. |
| **[Out]** | `Promise<Array>` — Mảng cấu hình cột. Trả `[]` nếu lỗi. |

---

### `getNhomLopData(namTaiChinh?, trang_thai_loc?)`

| Trục | Mô tả |
|---|---|
| **[In]** | `namTaiChinh` (string\|null, default: `null`) — Lọc theo năm tài chính; `trang_thai_loc` (string\|null, default: `null`) — Lọc theo trạng thái |
| **[Deps]** | `fetch`, endpoint `GET {API_PREFIX}/cq-nhom-lop-hoc-phan/?[nam_tai_chinh=&trang_thai_loc=]` |
| **[Side-effect / Proc]** | Xây dựng query string động bằng `URLSearchParams`. Có `try/catch`, ghi `console.error`. |
| **[Out]** | `Promise<Array>` — Mảng nhóm lớp học phần. Trả `[]` nếu lỗi. |

---

### `getHinhThucHoc()`

| Trục | Mô tả |
|---|---|
| **[In]** | *(không có)* |
| **[Deps]** | `fetch`, endpoint `GET {API_PREFIX}/hinh-thuc-hoc/` |
| **[Side-effect / Proc]** | Gọi mạng, **không có try/catch** — ném Error ra caller nếu thất bại. |
| **[Out]** | `Promise<Array>` — Mảng hình thức học. Ném `Error` nếu thất bại. |

---

### `getHinhThucDay()`

| Trục | Mô tả |
|---|---|
| **[In]** | *(không có)* |
| **[Deps]** | `fetch`, endpoint `GET {API_PREFIX}/hinh-thuc-day/` |
| **[Side-effect / Proc]** | Gọi mạng, **không có try/catch** — ném Error ra caller. |
| **[Out]** | `Promise<Array>` — Mảng hình thức dạy. Ném `Error` nếu thất bại. |

---

### `bulkUpdateNhomLop(payload)`

| Trục | Mô tả |
|---|---|
| **[In]** | `payload` (Object\|Array) — Dữ liệu cập nhật hàng loạt |
| **[Deps]** | `fetch`, endpoint `PUT {API_PREFIX}/cq-nhom-lop-hoc-phan/bulk-update` |
| **[Side-effect / Proc]** | Gọi mạng PUT với JSON body. Nếu lỗi, parse JSON lỗi và ném `Error(detail)`. Không có try/catch bao ngoài. |
| **[Out]** | `Promise<Object>` — Response JSON từ server. Ném `Error` nếu thất bại. |

---

### `confirmNhomLopHocPhan(listMa, namTaiChinh)`

| Trục | Mô tả |
|---|---|
| **[In]** | `listMa` (Array) — Danh sách mã nhóm lớp học phần cần xác nhận; `namTaiChinh` (string) — Năm tài chính, encode URI |
| **[Deps]** | `fetch`, endpoint `POST {API_PREFIX}/cq-nhom-lop-hoc-phan/xac-nhan-hang-loat?nam_tai_chinh={namTaiChinh}` |
| **[Side-effect / Proc]** | Gọi mạng POST với body `{ ma_nhom_lop_hp_list: listMa }`. Nếu lỗi, parse JSON lỗi và ném `Error(detail)`. Không có try/catch bao ngoài. |
| **[Out]** | `Promise<Object>` — Response JSON từ server. Ném `Error` nếu thất bại. |

# Tài liệu API Layer: NhomCongThucQuyDoiApi

**Đường dẫn:** `static/js/api/admin/nhomCongThucQuyDoiApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiCongThuc` — API Layer phục vụ trang Quản lý Nhóm Công thức Quy đổi.

> ⚠️ **[NAMING_STYLE] (Severity: MINOR)**: Tên object là `apiCongThuc` nhưng file tên là `nhomCongThucQuyDoiApi.js`. Không chặn merge nhưng nên thống nhất.

---

## Danh sách phương thức (Methods)

### `getColumnsConfig()`
| [In] | [Deps] | [Out] |
|---|---|---|
| *(không có)* | `GET {API_PREFIX}/cau-hinh-chung/danh-sach-cot/HETHONG_NhomCongThuc` | `Promise<Array>` — Trả `[]` nếu lỗi |

---

### `getCongThucData(id_he?, trang_thai?)`
| [In] | [Deps] | [Out] |
|---|---|---|
| `id_he` (string\|null, default `null`); `trang_thai` (string\|null, default `null`) | `GET {API_PREFIX}/nhom-cong-thuc/?[id_he=&trang_thai=]` | `Promise<Array>` — Trả `[]` nếu lỗi |

Query string chỉ được thêm khi cả `id_he !== null && id_he !== ''` (tương tự `trang_thai`).

---

### `getHinhThucDay()`
| [In] | [Deps] | [Out] |
|---|---|---|
| *(không có)* | `GET {API_PREFIX}/hinh-thuc-day/` | `Promise<Array>` — Trả `[]` nếu lỗi |

---

### `createNhomCongThuc(payload)`
| [In] | [Deps] | [Out] |
|---|---|---|
| `payload` (Object) | `POST {API_PREFIX}/nhom-cong-thuc/` với body JSON | `Promise<Object>` — Ném `Error` nếu thất bại (ném lại sau catch) |

---

### `updateNhomCongThuc(id, payload)`
| [In] | [Deps] | [Out] |
|---|---|---|
| `id` (any); `payload` (Object) | `PUT {API_PREFIX}/nhom-cong-thuc/{id}` với body JSON | `Promise<Object>` — Ném `Error` nếu thất bại |

---

### `deleteNhomCongThuc(id)`
| [In] | [Deps] | [Out] |
|---|---|---|
| `id` (any) | `DELETE {API_PREFIX}/nhom-cong-thuc/{id}` | `Promise<Object>` — Ném `Error` nếu thất bại |

---

### `getTuDienBienSo(id_he?, trang_thai?)` 

| [In] | [Deps] | [Out] |
|---|---|---|
| `id_he` (number, default `1`); `trang_thai` (number, default `1`) | `GET {API_PREFIX}/cau-hinh-chung/tu-dien-bien-so?id_he=&trang_thai=` | `Promise<Array>` — Trả `[]` nếu lỗi |

---

### `getNamTaiChinh()`
| [In] | [Deps] | [Out] |
|---|---|---|
| *(không có)* | `GET /api/v1/nam-tai-chinh/` (hard-coded, không dùng `window.API_PREFIX`) | `Promise<Array>` — Trả `[]` nếu lỗi |

---

### `getHeDaoTao()`
| [In] | [Deps] | [Out] |
|---|---|---|
| *(không có)* | `GET /api/v1/he-dao-tao/` (hard-coded) | `Promise<Array>` — Trả `[]` nếu lỗi |

---

### `getHinhThucHoc()`
| [In] | [Deps] | [Out] |
|---|---|---|
| *(không có)* | `GET /api/v1/hinh-thuc-hoc/` (hard-coded) | `Promise<Array>` — Trả `[]` nếu lỗi |

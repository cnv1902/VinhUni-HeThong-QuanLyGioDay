# Tài liệu API Layer: HeDaoTaoChinhQuyApi

**Đường dẫn:** `static/js/api/admin/heDaoTaoChinhQuyApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiHeDaoTaoChinhQuy` — API Layer phục vụ trang Dashboard Hệ đào tạo chính quy.

---

## Danh sách phương thức (Methods)

### `apiHeDaoTaoChinhQuy.getDashboardStats(namTaiChinh)`

| Trục | Mô tả |
|---|---|
| **[In]** | `namTaiChinh` (string\|number) — Mã năm tài chính, được encode URI trước khi đưa vào query string |
| **[Deps]** | `fetch` (Web API), `window.API_PREFIX`, endpoint `GET {API_PREFIX}/cq-dashboard?nam_tai_chinh={namTaiChinh}` |
| **[Side-effect / Proc]** | Gọi mạng bất đồng bộ `GET {API_PREFIX}/cq-dashboard`. Nếu `response.ok === false` ném `Error('HTTP {status}')`. Không có try/catch — lỗi truyền thẳng lên caller. |
| **[Out]** | `Promise<Object>` — Object thống kê dashboard dạng JSON. Ném `Error` nếu thất bại. |

---

## Ghi chú

- **Không nuốt lỗi** — ném thẳng ra caller, khác với `navbarApi` hay `lopHocPhanChinhQuyApi`. Caller cần tự bắt `try/catch`.

---

## ❌ Lỗi phát hiện (Rule Checker)

```
❌ [MISSING_EXPORT] (Severity: MINOR)
  MD Spec: (chưa có)
  JS Code: Object được khai báo dạng const apiHeDaoTaoChinhQuy = {...} — global, không có try/catch, không có JSDoc
  Fix: Cập nhật MD (file này) — đã xử lý. Không cần sửa code.
```

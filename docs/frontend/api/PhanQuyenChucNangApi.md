# Tài liệu API Layer: PhanQuyenChucNangApi

**Đường dẫn:** `static/js/api/phanQuyenChucNangApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiPhanQuyenChucNang` — API Layer chuyên dụng lấy danh sách chức năng (phân quyền) của người dùng đang đăng nhập. Tuân thủ Repository Pattern (Rule 13.0 ui-rules.md).

---

## Danh sách phương thức (Methods)

### `apiPhanQuyenChucNang.getDanhSachChucNang(token)`

| Trục | Mô tả |
|---|---|
| **[In]** | `token` (string) — Access Token JWT dài hạn (12 giờ), lấy từ `localStorage.getItem('access_token')` |
| **[Deps]** | `fetch` (Web API built-in), endpoint `GET /api/v1/phan-quyen-chuc-nang/` |
| **[Side-effect / Proc]** | Gọi mạng bất đồng bộ: `GET /api/v1/phan-quyen-chuc-nang/` với header `Authorization: Bearer {token}`. Nếu `response.status === 401` ném `Error('UNAUTHORIZED')`. Nếu lỗi khác ném `Error('Lỗi khi tải danh sách chức năng')`. |
| **[Out]** | `Promise<Array>` — Mảng phẳng (flat array) các object chức năng. Mỗi phần tử có ít nhất `CN_ID`, `CN_Ten`, `CN_URL`, `CN_Thuoc`. Ném `Error` nếu thất bại. |

---

## Ký hiệu lỗi đặc biệt

| Mã lỗi | Ý nghĩa | Hành vi UI |
|---|---|---|
| `'UNAUTHORIZED'` | Token hết hạn hoặc không hợp lệ (HTTP 401) | `sidebar.js` bắt lỗi này và redirect sang `/no-access` |

---

## Ví dụ sử dụng

```javascript
// Trong sidebar.js (UI Layer) — gọi qua API Layer
try {
    const flatData = await apiPhanQuyenChucNang.getDanhSachChucNang(token);
    // flatData là mảng phẳng, cần qua buildMenuTree() trước khi render
    const menuTree = buildMenuTree(flatData);
    DOM.dynamicSidebarMenu.innerHTML = renderMenuHTML(menuTree);
} catch (error) {
    if (error.message === 'UNAUTHORIZED') {
        localStorage.removeItem('access_token');
        window.location.href = '/no-access';
    }
}
```

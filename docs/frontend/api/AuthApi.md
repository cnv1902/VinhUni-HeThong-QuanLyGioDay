# Tài liệu API Layer: AuthApi

**Đường dẫn:** `static/js/api/authApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiAuth` — API Layer chuyên dụng giao tiếp với Backend xác thực SSO. Tuân thủ Repository Pattern (Rule 13.0 ui-rules.md): không có bất kỳ lệnh `fetch()` nào trong UI Layer.

---

## Danh sách phương thức (Methods)

### `apiAuth.exchangeToken(transferToken)`

| Trục | Mô tả |
|---|---|
| **[In]** | `transferToken` (string) — JWT trung chuyển thời hạn 1 phút, nhận từ URL param `?transfer_token=` |
| **[Deps]** | `fetch` (Web API built-in), endpoint `POST /api/v1/auth/exchange` |
| **[Side-effect / Proc]** | Gọi mạng bất đồng bộ: `POST /api/v1/auth/exchange` với body `{ transfer_token }`. Nếu `response.ok === false`, parse JSON lỗi và `throw new Error(err.detail \|\| 'Transfer Token hết hạn hoặc không hợp lệ')` |
| **[Out]** | `Promise<Object>` — Object JSON từ server, chứa ít nhất trường `access_token` (string). Ném `Error` nếu thất bại. |

---

## Ví dụ sử dụng

```javascript
// Trong sidebar.js (UI Layer) — gọi qua API Layer, không fetch trực tiếp
try {
    const data = await apiAuth.exchangeToken(transferToken);
    localStorage.setItem('access_token', data.access_token);
} catch (error) {
    console.error('Lỗi SSO:', error.message);
}
```

---

## Ghi chú kiến trúc

- Được load trước `sidebar.js` trong `sidebar.html` theo thứ tự script.
- Biến `apiAuth` là **global object** (không dùng ES Module `export`), truy cập trực tiếp từ mọi file JS được load sau nó trên cùng trang.

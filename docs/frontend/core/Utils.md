# Tài liệu Core: Utils

**Đường dẫn:** `static/js/core/utils.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Tập hợp các hàm tiện ích (utility functions) dùng chung toàn hệ thống. Khai báo ở global scope (không wrap trong module), truy cập trực tiếp từ mọi file JS được load sau.

---

## Danh sách hàm (Methods)

### `esc(v)`

| Trục | Mô tả |
|---|---|
| **[In]** | `v` (any) — Giá trị cần escape. Nếu `null` hoặc `undefined` sẽ được xử lý như chuỗi rỗng `''`. |
| **[Deps]** | Không có |
| **[Side-effect / Proc]** | Chuyển `v` thành string, thay thế 5 ký tự đặc biệt HTML: `&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`, `"` → `&quot;`, `'` → `&#39;`. |
| **[Out]** | `string` — Chuỗi đã được escape an toàn để nhúng vào innerHTML. |

**Mục đích:** Ngăn chặn XSS khi render dữ liệu từ API vào DOM bằng template literal.

---

### `parseNum(v, fallback)`

| Trục | Mô tả |
|---|---|
| **[In]** | `v` (any) — Giá trị cần parse; `fallback` (any) — Giá trị trả về nếu `v` không phải số hợp lệ |
| **[Deps]** | Không có |
| **[Side-effect / Proc]** | Gọi `parseFloat(v)`. Nếu kết quả là `NaN` thì trả về `fallback`. |
| **[Out]** | `number` hoặc kiểu của `fallback` — Số thực hợp lệ hoặc fallback. |

---

## Ví dụ sử dụng

```javascript
// Escape dữ liệu trước khi nhúng vào template
const html = `<td>${esc(row.ten_mon_hoc)}</td>`;

// Parse số với giá trị mặc định
const soTietLT = parseNum(row.tiet_ltkk, 0); // Trả về 0 nếu không phải số
```

---

## ⚠️ Ghi chú

- File hiện tại chỉ có 2 dòng, không có khoảng cách hay JSDoc. Nên bổ sung JSDoc để tương thích với Rule 13 (ui-rules.md mục 2: "Bắt buộc chú thích JSDoc").

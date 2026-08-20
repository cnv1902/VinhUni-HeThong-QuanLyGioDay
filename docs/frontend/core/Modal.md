# Tài liệu Core: Modal (BaseModal)

**Đường dẫn:** `static/js/core/modal.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

`BaseModal` là Class lõi quản lý trạng thái và sự kiện chung cho mọi Modal trong hệ thống. Tuân thủ Rule 15 (ui-rules.md): mọi Modal Thêm/Sửa/Xóa bắt buộc kế thừa hoặc sử dụng Class này. Được export ra global thông qua `window.BaseModal = BaseModal`.

---

## 1. Tham số khởi tạo (Inputs)

```javascript
new BaseModal(modalId)
```

| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `modalId` | string | ✅ | ID (không có dấu `#`) của thẻ `.modal-overlay` trong DOM |

---

## 2. Thuộc tính public (Properties)

| Thuộc tính | Kiểu mặc định | Mô tả |
|---|---|---|
| `this.modal` | HTMLElement\|null | Tham chiếu đến thẻ overlay tìm được qua `getElementById` |
| `this.closeBtns` | NodeList | Tất cả các thẻ có attribute `[data-close-modal]` bên trong modal |
| `this.onOpen` | null → Function | Hook callback được gọi sau khi modal mở. Gán từ ngoài vào. |
| `this.onClose` | null → Function | Hook callback được gọi sau khi modal đóng. Gán từ ngoài vào. |

---

## 3. Các phương thức public (Methods)

### `open()`
- Đặt `this.modal.style.display = 'flex'`.
- Gọi `this.onOpen()` nếu được gán.
- **Không tự reset form** — component con phải tự reset trước khi gọi `open()`.

### `close()`
- Đặt `this.modal.style.display = 'none'`.
- Gọi `this.onClose()` nếu được gán.

### `bindEvents()` *(internal)*
Gắn 3 sự kiện đóng modal tự động trong constructor:
1. Click vào bất kỳ `[data-close-modal]` bên trong modal.
2. `mousedown` vào đúng thẻ overlay (click ra ngoài vùng content).
3. `keydown` phím `Escape` trên `document` — chỉ đóng khi `modal.style.display === 'flex'`.

---

## 4. Kết quả đầu ra / Export

- `window.BaseModal = BaseModal` — accessible toàn cục từ mọi page JS được load sau.
- Không phát CustomEvent ra ngoài.

---

## 5. Ví dụ sử dụng

```javascript
// Component con kế thừa
class MyModal extends BaseModal {
    constructor() {
        super('myModalOverlay'); // ID của thẻ modal-overlay trong HTML
        this.form = document.getElementById('myForm');

        // Hook cleanup khi đóng
        this.onClose = () => {
            this.form.reset();
        };
    }
}

const myModal = new MyModal();
document.getElementById('btnOpen').addEventListener('click', () => myModal.open());
```

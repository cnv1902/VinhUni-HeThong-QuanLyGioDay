# Tài liệu Component: Confirm Modal

**Đường dẫn:** `static/js/components/confirm_modal.js`

ConfirmModal là một UI Component quản lý hộp thoại xác nhận tập trung, đóng vai trò thay thế cho hàm `window.confirm()` mặc định của trình duyệt với thiết kế thân thiện hơn và hỗ trợ xử lý bất đồng bộ (Promise).

## 1. Tham số khởi tạo (Inputs)

Component này sử dụng mẫu thiết kế (pattern) Singleton. Khởi tạo bằng `new ConfirmModal()`, tự động được chạy khi sự kiện `DOMContentLoaded` phát ra và được gán vào biến toàn cục `confirmModal`.

Không yêu cầu tham số truyền vào hàm constructor. Nó tự động truy xuất các thẻ DOM đã được định nghĩa sẵn trong Layout.

## 2. Các hàm chức năng (Methods)

Hàm public duy nhất dùng để tương tác từ bên ngoài:

* **`show(message, title, confirmText, confirmColor)`**: Kích hoạt hiển thị modal xác nhận.
  * `message` (string): Nội dung chính của hộp thoại (Hỗ trợ định dạng HTML).
  * `title` (string): Tiêu đề hộp thoại. Mặc định là `'Xác nhận'`.
  * `confirmText` (string): Chữ hiển thị trên nút đồng ý. Mặc định là `'Xác nhận'`.
  * `confirmColor` (string): Mã màu (CSS color) của nút đồng ý. Mặc định là `'var(--red-600)'`.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Khởi tạo và Tham chiếu DOM:** Constructor tìm kiếm và gán các phần tử có sẵn: `#globalConfirmModal`, `#confirmModalTitle`, `#confirmModalMessage`, `#btnConfirmOk`, `#btnConfirmCancel`.
2. **Kế thừa BaseModal:** Component gọi đến `new BaseModal('globalConfirmModal')` để được tự động hỗ trợ các thao tác như làm mờ nền (overlay), animation mở/đóng, nhấn ra ngoài để đóng.
3. **Xử lý sự kiện (Event Manipulation):** 
   * Tránh việc rò rỉ bộ nhớ (memory leaks) và duplicate sự kiện do `show()` được gọi nhiều lần ở nhiều nơi, hàm Constructor tiến hành nhân bản các nút (`cloneNode`) và thay thế chính nó trên DOM để xóa hoàn toàn các `EventListener` cũ.
   * Gắn sự kiện `click` cho nút Đồng ý để gọi hàm `resolve(true)` của Promise và đóng modal.
   * Gắn sự kiện `click` cho nút Hủy, hoặc các nút có thuộc tính `[data-close-modal]` để gọi hàm `resolve(false)` của Promise và đóng modal.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:** Các thuộc tính nội dung (`textContent`, `innerHTML`), chữ và CSS màu nền (`backgroundColor`, `borderColor`) của các thẻ nội dung bên trong modal sẽ bị thay đổi dựa theo tham số truyền vào hàm `show`.
* **Output trả về:** Hàm `show()` trả về một đối tượng **`Promise<boolean>`**:
  * Trả về `true` khi người dùng nhấn nút Xác nhận.
  * Trả về `false` khi người dùng nhấn Hủy, hoặc đóng hộp thoại.
  * Không phát ra Custom Event nào.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// Lưu ý: Không cần gọi new ConfirmModal() thủ công 
// vì nó đã được khởi tạo tự động thành biến toàn cục `confirmModal`

document.getElementById('btnDelete').addEventListener('click', async () => {
  // 1. Gọi hàm show và chờ kết quả trả về bằng Promise (async/await)
  const isConfirmed = await confirmModal.show(
    "Bạn có chắc chắn muốn xóa dữ liệu này không? Hành động này <b>không thể hoàn tác</b>.",
    "Cảnh báo xóa",
    "Xóa ngay",
    "var(--red-600)" // Màu đỏ cảnh báo
  );

  // 2. Xử lý logic dựa trên kết quả
  if (isConfirmed) {
    // Người dùng chọn "Xóa ngay"
    console.log("Đang tiến hành gọi API xóa...");
    // await fetch('/api/delete/...', { method: 'DELETE' });
  } else {
    // Người dùng chọn "Hủy" hoặc đóng hộp thoại
    console.log("Đã hủy thao tác xóa.");
  }
});
```

# Tài liệu Component: Toast

**Đường dẫn:** `static/js/components/toast.js`

Toast là một Utility Component siêu nhẹ, cung cấp thông báo popup nhỏ nổi lên màn hình (như "Đã lưu thành công", "Lỗi mạng") rồi tự động biến mất. 

## 1. Tham số khởi tạo (Inputs)

Component này không viết dưới dạng Class (không cần lệnh `new`). Nó chỉ định nghĩa duy nhất một hàm toàn cục (global function). Do đó, không có `options` hay constructor khởi tạo.

## 2. Các hàm chức năng (Methods)

Chỉ có một hàm public duy nhất dùng ở mọi nơi:

* **`showToast(msg)`**: Gọi để hiển thị một thông báo.
  * `msg` (string): Chuỗi văn bản muốn hiển thị bên trong hộp thoại Toast.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Khởi tạo và Render DOM:** Khi gọi hàm, Component dùng `document.createElement('div')` để tạo nóng một thẻ div class `.toast` chứa nội dung tin nhắn, sau đó dùng lệnh `appendChild` móc nối nó vào thùng chứa `#toastStack` được đặt cố định (fixed) trên Layout chung.
2. **Xử lý Animation (Micro-interactions):** Để CSS Transition (hiệu ứng trượt/mờ) hoạt động chính xác khi phần tử mới được chèn vào DOM, Component sử dụng API `requestAnimationFrame` để chờ trình duyệt vẽ xong DOM thì mới bổ sung class `.show`.
3. **Tự động hủy (Garbage Collection):** Dùng `setTimeout` hẹn giờ sau 2.6 giây sẽ gỡ class `.show` để kích hoạt hiệu ứng biến mất, rồi chờ thêm 250ms (đúng bằng thời gian CSS animation chạy) để gọi lệnh `el.remove()` dọn dẹp hoàn toàn thẻ DOM ra khỏi bộ nhớ.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:** Thêm và xóa động các thẻ `div.toast` bên trong thẻ có id `toastStack`.
* **Output / Events:** Không cập nhật giá trị form (hidden input) nào. Hoạt động độc lập và hoàn toàn không trigger (phát ra) CustomEvent nào ra bên ngoài.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// Vì Toast là hàm toàn cục (global function), bạn có thể gọi trực tiếp ở bất kỳ file js nào.

document.getElementById('btnSaveData').addEventListener('click', async () => {
  try {
    // const res = await fetch('/api/save', { method: 'POST' });
    // if (!res.ok) throw new Error("Lỗi mạng");
    
    // Hiển thị thông báo thành công (tự biến mất sau 2.6s)
    showToast("Đã lưu dữ liệu thành công!");
    
  } catch (error) {
    // Hiển thị thông báo lỗi
    showToast("Lưu thất bại. Vui lòng thử lại!");
  }
});
```

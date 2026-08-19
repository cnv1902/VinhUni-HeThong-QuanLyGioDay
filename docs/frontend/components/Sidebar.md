# Tài liệu Component: Sidebar

**Đường dẫn:** `static/js/components/sidebar.js`

Sidebar Component chịu trách nhiệm quản lý thanh trình đơn (Menu) điều hướng bên trái màn hình. Component quản lý 3 tính năng lõi: Co/giãn chiều rộng (Resize), Thu gọn (Collapse), và Phục hồi vị trí thanh cuộn/menu khi chuyển trang.

## 1. Tham số khởi tạo (Inputs)

Module này được thiết kế theo dạng hàm IIFE (Immediately Invoked Function Expression) tự chạy ngay khi file được tải hoặc thông qua các sự kiện Listener toàn cục. Không có Class, không có hàm `new Sidebar()`, không yêu cầu truyền tham số cấu hình.

## 2. Các hàm chức năng (Methods)

Đây là một logic chạy ngầm quản lý DOM, nó **không bộc lộ** bất kỳ public method nào ra cho bên ngoài gọi (như `open()`, `close()`). Nó phản hồi dựa trên các thao tác vật lý của người dùng trên DOM.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

Mã nguồn được chia thành 3 phân khu xử lý độc lập:

1. **State Phân cấp Menu (Submenu Restoration):**
   * Quét toàn bộ DOM để tìm thẻ `.has-submenu`. Đọc trạng thái lưu trong `localStorage` (Ví dụ: key `sidebar_submenu_admin`) để quyết định đặt thuộc tính CSS `display: block/none` và toggle class `open` cho icon.
   * Gắn sự kiện `click` cho thẻ `.submenu-toggle` để vừa sửa CSS để đóng mở, vừa ghi trạng thái mới vào bộ nhớ trình duyệt.

2. **Logic Resize và Collapse (Co giãn & Thu gọn):**
   * **Thu gọn:** Bắt sự kiện click vào `#btnSidebarToggle`, bật/tắt class CSS `.collapsed` trên thanh sidebar và lưu biến `sidebarCollapsed` vào Local Storage.
   * **Kéo (Resize):** Lắng nghe các event chuột (`mousedown`, `mousemove`, `mouseup`) trên dải màu mép `#sidebarResizer`. Trong lúc kéo (`mousemove`), tính toán tọa độ trục X (`clientX`), cộng trừ độ dài để cập nhật biến toàn cục CSS (`--sidebar-width`).
   * **Optimization:** Trong lúc kéo, khóa chức năng bôi đen văn bản (`userSelect = 'none'`) và thêm class `no-transition` để tắt hiệu ứng mượt, giúp con trỏ chuột không bị giật lùi so với đường kéo.

3. **Restoration (Bảo toàn vị trí cuộn):**
   * Gắn sự kiện `scroll` vào thẻ chứa nội dung `.sidebar-content`. Sử dụng kỹ thuật `Debounce` (chờ 100ms sau khi ngừng cuộn) mới lưu `scrollTop` vào thẻ `sessionStorage` (để tránh spam ổ cứng liên tục).
   * Khi chuyển trang, lấy con số `scrollTop` gán ngược lại. Áp dụng hack `setTimeout(50ms)` để phục hồi lần 2 phòng trường hợp cây DOM nạp chưa xong gây sụt thanh cuộn.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Manipulation:** 
  * Thay đổi trực tiếp biến CSS `--sidebar-width` gắn trên thẻ `.sidebar`.
  * Thêm/bớt các class `collapsed`, `open`.
  * Sửa thuộc tính CSS `display` và `scrollTop`.
* **State Lưu trữ ngầm:** Cập nhật dữ liệu rất nhiều vào bộ nhớ trình duyệt: `localStorage` (`sidebarWidth`, `sidebarCollapsed`, `sidebar_submenu_*`) và `sessionStorage` (`sidebarScrollTop`).
* **Events:** Không phát ra CustomEvent nào ra bên ngoài. Hoạt động độc lập hoàn toàn.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// Sidebar là một module chạy tự động (IIFE), không cần khởi tạo class hay gọi API.
// Mã dưới đây minh họa cách các phần tử HTML cần được thiết kế 
// để Sidebar nhận diện và hoạt động đúng logic.

/*
<!-- Cấu trúc HTML mẫu -->
<aside class="sidebar">
  <div id="sidebarResizer" class="resizer"></div>
  <button id="btnSidebarToggle">Thu gọn/Mở rộng</button>
  
  <div class="sidebar-content">
    <ul>
      <!-- Khai báo data-menu-id để lưu trạng thái đóng/mở -->
      <li class="has-submenu" data-menu-id="menu_quanly">
        <a href="#" class="submenu-toggle">Quản lý chung</a>
        <ul class="sidebar-submenu">
          <li><a href="#">Trang con 1</a></li>
        </ul>
      </li>
    </ul>
  </div>
</aside>
*/

// JS tham khảo (Lấy trạng thái sidebar từ nơi khác):
const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
console.log("Sidebar hiện đang thu gọn?", isCollapsed);
```

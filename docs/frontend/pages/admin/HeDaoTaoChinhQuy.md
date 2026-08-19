# Tài liệu Component: Page - Hệ Đào Tạo Chính Quy (Dashboard)

**Đường dẫn:** `static/js/pages/admin/he_dao_tao_chinh_quy.js`

Đây là một Page-Level Component tối giản (Vanilla JS) đóng vai trò điều khiển bảng điều khiển (Dashboard) của trang Hệ Đào tạo Chính quy. Nhiệm vụ chính của nó là lắng nghe sự thay đổi Năm học/Học kỳ từ thanh Navbar, sau đó tải và render các con số thống kê (Cards) lên giao diện.

## 1. Tham số khởi tạo (Inputs)

Kịch bản chạy tự động dưới dạng Script thủ tục (Procedural Script). Không có constructor `new ClassName()`.

* **Dữ liệu mồi (DOM References):** Khởi tạo một object `elements` lưu cứng tham chiếu tới các thẻ `<span id="...">` hoặc `<div>` trên giao diện, ví dụ `#dashTongNhomLop`, `#dashDaXacNhan`, `#dashDaThanhToan`.
* **Trigger Input:** Nhận đầu vào dưới dạng chuỗi `Context` (ví dụ: `"1_2024-2025"`) lấy trực tiếp từ thuộc tính `e.detail` của Custom Event do Navbar phát ra.

## 2. Các hàm chức năng (Methods)

* **`loadDashboardStats(hocKy)`**: Hàm Async trung tâm. Nhận chuỗi ID học kỳ, chuyển giao diện sang trạng thái Loading, sau đó gọi `apiHeDaoTaoChinhQuy.getDashboardStats()` để lấy số liệu thực tế.
* **`renderDashboard(data)`**: Hàm ánh xạ (Mapping) dữ liệu JSON vào các thẻ DOM tương ứng trong object `elements`.
* **`setLoadingState()`**: Đặt trạng thái chờ (Ví dụ: `...`) cho toàn bộ thẻ số liệu.
* **`formatNum(value)`**: Hàm tiện ích định dạng tiền tệ / con số (Ví dụ: `1000000` thành `1.000.000`) sử dụng API chuẩn `Intl.NumberFormat('vi-VN')`.
* **`bindContextEvents()`**: Hàm khởi động, gắn các bộ lắng nghe sự kiện toàn cục.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Event-Driven Architecture:** Kịch bản không tự tiện gọi API lúc trang vừa mở. Thay vào đó, nó thụ động đứng đợi. Thông qua hàm `bindContextEvents()`, nó lắng nghe hai sự kiện toàn cục là `ContextReady` (lần load đầu) và `ContextChanged` (khi user đổi select box Học kỳ).
2. **Micro-interaction (Loading State):** Trước khi gọi API, hàm `setLoadingState()` được kích hoạt, lặp qua toàn bộ thuộc tính của biến `elements` để đổi Text thành dấu ba chấm (`...`). Điều này giúp UI không bị giật hoặc đọng số liệu cũ khi mạng chậm.
3. **Graceful Degradation (Xử lý lỗi):** Bọc khối gọi API bằng `try...catch`. Nếu Backend sập hoặc lỗi mạng, hàm `catch` sẽ chủ động gọi `renderDashboard({})` (truyền object rỗng) để giao diện tự reset về số 0 thay vì treo cứng.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:** Can thiệp trực tiếp vào thuộc tính `textContent` của các thẻ DOM nằm trong `elements` để hiển thị những con số đã được format.
* **Output / Events:** Không cập nhật Input Hidden nào. Hoàn toàn là một nút "Nhận" (Consumer) cuối cùng của chuỗi sự kiện, không phát ra bất kỳ Custom Event nào ra ngoài.

## 5. Ví dụ thực tế (Usage Example)

Cách nhúng và cách thức Component này "giao tiếp" với Navbar trong thực tế:

```html
<!-- 1. Giao diện Dashboard các thẻ thống kê -->
<div class="dashboard-cards">
  <div class="card">
    <p>Tổng nhóm lớp</p>
    <h3 id="dashTongNhomLop">0</h3>
  </div>
  <div class="card">
    <p>Đã thanh toán</p>
    <h3 id="dashDaThanhToan">0</h3>
  </div>
</div>

<!-- 2. Nhúng Scripts (Lưu ý: Phải có api file và navbar file chạy trước) -->
<script src="/static/js/api/admin/heDaoTaoChinhQuyApi.js"></script>
<script src="/static/js/pages/admin/he_dao_tao_chinh_quy.js"></script>

<!-- 3. Mô phỏng chuỗi sự kiện (Thường do navbar.js tự động làm) -->
<script>
  // Mô phỏng: Khi Navbar đã nạp xong Học kỳ mặc định (Ví dụ: 2_2023-2024)
  // Nó sẽ phát ra một sự kiện toàn cục.
  const mockContextEvent = new CustomEvent('ContextReady', {
    detail: "2_2023-2024"
  });
  
  // Ngay lập tức, file he_dao_tao_chinh_quy.js sẽ bắt được sự kiện này,
  // Đổi toàn bộ các số 0 thành "..." 
  // Rồi gọi API và điền kết quả vào #dashTongNhomLop, #dashDaThanhToan.
  window.dispatchEvent(mockContextEvent);
</script>
```

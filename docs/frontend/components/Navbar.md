# Tài liệu Component: Navbar

**Đường dẫn:** `static/js/components/navbar.js`

Navbar Component quản lý vùng thanh điều hướng chung của ứng dụng, chịu trách nhiệm lưu trữ và quản lý State toàn cục liên quan đến Context làm việc: Năm học và Học kỳ.

## 1. Tham số khởi tạo (Inputs)

Component này thiết kế dạng các hàm chức năng rời rạc hoạt động trên một đối tượng trạng thái chung, không dùng cú pháp class (không có constructor `new Navbar()`). Quá trình khởi tạo tự động chạy từ hàm `initNavbar()` khi DOM tải xong.

**Dữ liệu đầu vào lấy từ:**
* Hàm `apiNavbar.getHocKyList()`: Lấy mảng dữ liệu danh sách học kỳ từ server. Định dạng phần tử quan trọng nhất: `{ TenHocKy: "1_2024-2025" }`.
* Bộ nhớ trình duyệt `sessionStorage.getItem('CTX_HOC_KY_NAM_HOC')`: Đọc giá trị đã chọn gần nhất để phục hồi State.

## 2. Các hàm chức năng (Methods)

Component này không bộc lộ public method để các file khác gọi trực tiếp, mà hoạt động ngầm. Các hàm nội bộ cấu thành bao gồm:

* **`initNavbar()`**: Hàm khởi động chính, nạp dữ liệu và phục hồi State.
* **`applyContextFromTenHocKy(tenHocKy)`**: Phân tách chuỗi `TenHocKy` thành các giá trị rời rạc và lưu vào State.
* **`renderNamHocOptions()`**: Vẽ ra giao diện danh sách thẻ `<option>` Năm học.
* **`renderHocKyOptions()`**: Vẽ ra giao diện danh sách thẻ `<option>` Học kỳ.
* **`handleContextChange()`**: Lắng nghe sự kiện thay đổi trên các Select Box để tìm kiếm cặp giá trị mới.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **State Management:** Dữ liệu danh sách và ngữ cảnh đang chọn được lưu trong biến state toàn cục `navbarState` (chứa `hocKyList`, `selectedMaHocKy`, `selectedNamHoc`, `selectedHocKy`).
2. **Tính toán Phân tách:** Hàm `applyContextFromTenHocKy` dùng phương thức `split('_')` để bóc tách Năm học (`2024-2025`) và Học kỳ (`1`) từ thuộc tính chuỗi tổng hợp `TenHocKy`, đồng thời lưu lại chuỗi này vào `sessionStorage` để lưu phiên.
3. **Lọc và Render DOM:** Các hàm `renderNamHocOptions` và `renderHocKyOptions` sử dụng `Set` để loại bỏ trùng lặp (distinct) năm học/học kỳ từ mảng dữ liệu, sắp xếp (sort) và nối chuỗi bằng `innerHTML` vào các thẻ HTML tương ứng (`#ctxNamHoc`, `#ctxHocKy`).
4. **Fallback Mechanism:** Tại hàm `handleContextChange`, khi người dùng chọn một Năm học mới mà Học kỳ hiện tại không tồn tại trong Năm học đó, hệ thống sẽ thực hiện Fallback: tự động tìm chuỗi `TenHocKy` hợp lệ đầu tiên bằng hàm `endsWith` thay vì để lỗi, sau đó cập nhật lại giao diện.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:** Trực tiếp ghi đè `innerHTML` và sửa thuộc tính `value` của 2 thẻ select: `#ctxHocKy` và `#ctxNamHoc`. Lưu trạng thái vào `sessionStorage`.
* **Output Events:** Hệ thống giao tiếp liên component bằng kiến trúc Event-Driven. Component sử dụng `window.dispatchEvent` để phát sóng Event toàn cục:
  * **`ContextReady`**: Kích hoạt khi khởi tạo thành công lần đầu tiên. Gửi kèm chuỗi context mặc định trong thuộc tính `detail`.
  * **`ContextChanged`**: Kích hoạt mỗi khi bộ lọc bị đổi. Gửi kèm chuỗi context mới (Ví dụ: `"2_2023-2024"`) qua thuộc tính `detail` để báo cho các component trang con tự động gọi lại API tải dữ liệu.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// Lưu ý: Navbar hoạt động ngầm định và không cần gọi khởi tạo thủ công.
// Mã nguồn dưới đây là cách các file JS của trang (Page-level) 
// "lắng nghe" và tương tác với Navbar.

// 1. Lắng nghe lúc Navbar load dữ liệu thành công lần đầu
window.addEventListener('ContextReady', (e) => {
  const currentContext = e.detail; // Ví dụ: "1_2024-2025"
  console.log("Navbar đã sẵn sàng. Context hiện tại là:", currentContext);
  
  // Tiến hành tải dữ liệu bảng dựa theo context này
  // loadTableData(currentContext);
});

// 2. Lắng nghe khi người dùng đổi học kỳ trên Header
window.addEventListener('ContextChanged', (e) => {
  const newContext = e.detail;
  console.log("Người dùng vừa đổi ngữ cảnh sang:", newContext);
  
  // Xóa trắng bảng cũ, tải lại dữ liệu mới
  // dataTable.clear();
  // loadTableData(newContext);
});
```

# Tài liệu Component: Page - Quản Lý Nhóm Lớp Học Phần

**Đường dẫn:** `static/js/pages/admin/quan_ly_nhom_lop_hoc_phan.js`

Đây là một Page-Level Component (Mã nguồn cấp độ trang) đóng vai trò điều khiển màn hình Quản lý Nhóm Lớp Học Phần (Hệ chính quy). Nó nổi bật với khả năng xử lý một lượng lớn dữ liệu thông qua Incremental Render, quản lý State phức tạp với tính năng Sửa hàng loạt (Bulk Update) và Chặn chuyển trang (Navigation Guard).

## 1. Tham số khởi tạo (Inputs)

File thiết kế dạng kịch bản thủ tục (Procedural Script), tự động chạy hàm `init()` ngay khi nạp mà không cần khởi tạo qua class `new...`.

Dữ liệu đầu vào bao gồm:
* Tham chiếu ngầm đến bộ thẻ DOM cố định của Layout (`#dataTable`, `#bulkHinhThucHocContainer`, `#btnSaveChanges`, ...).
* Biến State toàn cục: 
  * `modifiedRows` (để theo dõi dòng bị sửa cục bộ).
  * `bulkMaHTHoc`, `bulkMaHTDay` (để theo dõi giá trị cấu hình sửa hàng loạt).
  * `allowLeavePage` (Cờ bỏ qua cảnh báo thoát trang).

## 2. Các hàm chức năng (Methods)

Trang này tổ chức mã nguồn theo các hàm chức năng như sau:

* **`init()`**: Hàm khởi động, cấu hình `DataTable` (bao gồm Render Options, Edit Options và Validation) và vẽ cấu trúc Footer.
* **`loadTableData(hoc_ky)`**: Gọi API kéo dữ liệu theo mã học kỳ truyền vào. Thực hiện "chụp ảnh" dữ liệu gốc (`snapshotRows`) để phục vụ logic so sánh Dirty-check sau này.
* **`initBulkComboboxes()`**: Khởi tạo (hoặc Tải lười - Lazy load) các `ComboBox` dùng cho chức năng Cập nhật hàng loạt ngoài lưới.
* **`submitSaveChanges()`**: Gom toàn bộ thay đổi (Inline edit & Bulk edit), định dạng thành cấu trúc Payload và gửi API cập nhật (`apiLopHocPhanChinhQuy.bulkUpdateNhomLop`), sau đó gọi hàm patch `myTable.updateRowsData()` để ép lưới vẽ lại các dòng vừa lưu.
* **`bindStaticEvents()`**: Gắn mọi sự kiện tĩnh như Nút Lọc, Nút Lưu, Nút Hiện/Ẩn Bulk Panel.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **State Tracking phức tạp (Inline & Bulk):** Hàm `onRowDirty` tự động ghi nhận khi user nhấp đúp và sửa ô. Nó chặn (Validation) nếu chọn ngoài danh sách và ép tính lại Sĩ số tổng (`SoSinhVien = SiSoChuyenDoi + SiSoDKH`). Biến `modifiedRows` hoặc `bulkMa...` liên tục kích hoạt `updateSaveButtonVisibility()` để ẩn/hiện nút Lưu.
2. **Navigation Guard (Chặn rời trang):** Một tính năng rất cao cấp. Script bọc 3 lớp bảo vệ nếu phát hiện `hasUnsavedChanges()`:
   * Chặn tắt Tab/F5: Dùng `window.addEventListener('beforeunload', ...)`
   * Chặn nhấn Link điều hướng (Menu): Bắt sự kiện `click` toàn cục vào thẻ `a[href]`, gọi `confirmModal.show()`.
   * Chặn nút Back của Browser: Sử dụng API `history.pushState` và lắng nghe sự kiện `popstate`.
3. **Event-driven (Lắng nghe Navbar):** Trang này phụ thuộc vào Học kỳ. Nó không tự gọi API lúc tải, mà chờ Navbar phát sự kiện `ContextReady` hoặc `ContextChanged` để lấy mã học kỳ (`e.detail`) rồi mới gọi `loadTableData()`.
4. **Data Optimization:** `DataTable` được cấu hình `incrementalRender: true`, cho phép trang tải trước danh sách hàng ngàn nhóm lớp nhưng chỉ vẽ dần khi cuộn chuột, giúp không bị đơ trình duyệt.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:**
  * Vẽ hàng ngàn dòng bảng vào `#dataTable`. Khóa (không cho sửa) và bôi xám các dòng đã "Xác nhận".
  * Tạo/Gỡ thẻ `#bulkUpdatePanel`.
  * Cập nhật thông số thống kê vào `#pageFooter`.
* **Output:** Xử lý toàn bộ logic nội bộ, gọi API ghi thẳng xuống CSDL, và cập nhật cục bộ (`Patch Update`) lại UI. Không phát ra CustomEvent.

## 5. Ví dụ thực tế (Usage Example)

Cách nhúng và mô phỏng luồng hoạt động của trang:

```html
<!-- 1. Layout cơ bản của Trang -->
<div class="page-container">
  
  <div class="toolbar">
    <!-- Nút kích hoạt bảng cấu hình hàng loạt -->
    <button id="btnToggleBulkUpdate">Cập nhật hàng loạt</button>
    <button id="btnSaveChanges" style="display: none;">Lưu thay đổi</button>
  </div>

  <!-- Panel Ẩn: Cấu hình hàng loạt -->
  <div id="bulkUpdatePanel" hidden>
    <div id="bulkHinhThucHocContainer"></div>
    <div id="bulkHinhThucDayContainer"></div>
  </div>
  
  <table id="dataTable"><thead></thead><tbody></tbody></table>
  <footer id="pageFooter"></footer>
</div>

<!-- 2. Nhúng Script -->
<script src="/static/js/api/admin/lopHocPhanChinhQuyApi.js"></script>
<script src="/static/js/pages/admin/quan_ly_nhom_lop_hoc_phan.js"></script>

<!-- 3. Luồng chạy thực tế -->
<script>
  // Bước 1: File JS tự chạy init() (Vẽ Footer và cài đặt DataTable).
  // Bước 2: Tương tự trang Dashboard, file này chờ Navbar phát sự kiện
  window.dispatchEvent(new CustomEvent('ContextReady', { detail: "1_2024-2025" }));

  // Ngay lập tức file sẽ gọi API kéo dữ liệu học kỳ 1 của 2024-2025 về.
  
  // Bước 3: Người dùng tích chọn (checkbox) các dòng cần cập nhật trên bảng.
  // Bước 4: Người dùng bấm "Cập nhật hàng loạt".
  // File JS sẽ tải API Danh sách Hình thức Học/Dạy đổ vào ComboBox.
  // Khi người dùng chọn, biến `bulkMaHTHoc` được gán, nút Lưu hiện ra.
  // Nhấn lưu, toàn bộ các Nhóm Lớp đã được tích chọn (trừ lớp đã xác nhận) sẽ được đẩy qua API cập nhật.
</script>
```

# Tài liệu Component: Page - Danh Mục Trường Được Sử Dụng

**Đường dẫn:** `static/js/pages/admin/danh_muc_truong_duoc_su_dung.js`

Đây là một Page-Level Component (Mã nguồn cấp độ Trang), làm nhiệm vụ điều phối và kết nối các thành phần UI (DataTable, ComboBox, TableConfigModal) với Backend API để cung cấp giao diện "Cấu hình hiển thị cột cho các bảng".

## 1. Tham số khởi tạo (Inputs)

Vì đây là kịch bản chạy ở cấp độ trang (Page-Level Script), nó không được khởi tạo thông qua `new ClassName(...)`. Thay vào đó:

* Kịch bản tự động kích hoạt thông qua sự kiện `DOMContentLoaded` gọi hàm `init()`.
* Các tham số ngầm định lấy từ DOM bao gồm: `#filterMaBangContainer` (nơi gắn ComboBox), `#dataTable` (nơi gắn DataTable), `#btnSaveChanges` (nút lưu) và `#btnConfigTable`.

## 2. Các hàm chức năng (Methods)

Đây là các hàm nội bộ điều phối luồng chạy của trang:

* **`init()`**: Hàm mồi (bootstrap), thiết lập giá trị mặc định (`activeMaBang = 'all'`) và gọi tuần tự các hàm khởi tạo khác.
* **`initMaBangCombobox()`**: Khởi tạo UI chọn bảng. Đặc biệt: Ghi đè (override) hàm `setValue` của ComboBox để chèn logic cảnh báo nếu người dùng đang có dữ liệu sửa dở (`hasUnsavedChanges()`) mà cố tình chuyển bảng khác.
* **`initTable()`**: Khai báo và cấu hình siêu chi tiết cho `DataTable` (bao gồm `customCellRender`, `getCellEditorOptions`, `onRowDirty`).
* **`loadTableData(maBang)`**: Gọi API kéo dữ liệu danh sách cột của bảng, chụp lại bản sao (`snapshotRows`) để so sánh sự thay đổi, và đẩy vào `myTable.setData()`.
* **`hasUnsavedChanges()`**: Kiểm tra biến State toàn cục `modifiedRows` xem có dữ liệu nào chưa lưu không.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Dirty State Tracking (Theo dõi thay đổi):** Mọi sự kiện chỉnh sửa ô từ DataTable sẽ kích hoạt `onRowDirty(row, key, val)`. Trang tự động ép kiểu (VD: `'true'` thành `true` boolean). Nếu giá trị khác với `originalRowsById`, ID dòng đó sẽ được thêm vào object `modifiedRows`. Ngược lại, nếu người dùng sửa về đúng giá trị gốc, hàm sẽ tự động xóa ID khỏi `modifiedRows`.
2. **Nút Lưu Động (Reactive Save Button):** Mỗi khi `modifiedRows` thay đổi, hàm `updateSaveButtonVisibility()` sẽ hiện hoặc ẩn nút "Lưu thay đổi".
3. **Cảnh báo mất dữ liệu (BeforeUnload Hook):** Trang chủ động gắn listener `window.addEventListener('beforeunload', ...)` để chặn người dùng tắt tab/F5 trình duyệt nếu `hasUnsavedChanges()` trả về `true`.
4. **Tích hợp UI:** Khởi tạo `ComboBox` cho ô Lọc mã bảng, và liên kết nút "Cấu hình bảng" với tiện ích `TableConfigModal`.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:**
  * Render toàn bộ cấu trúc lưới vào `#dataTable`.
  * Ghi đè `display: inline-flex/none` cho nút `#btnSaveChanges`.
  * Cập nhật style nút (đổi thành "Đang lưu...") khi gọi API.
  * Tô màu đỏ/vàng cho dòng bị sửa bằng cách thêm class `.dirty-row`.
* **Sự kiện xuất:** Không phát CustomEvent. Hệ thống gọi trực tiếp `apiDanhMucTruongDuocSuDung.bulkUpdateDanhSachCot(payload)` để ghi thẳng xuống Database.

## 5. Ví dụ thực tế (Usage Example)

Đoạn code sau mô phỏng cách kịch bản này được nhúng vào HTML và cách nó hoạt động ngầm. Không cần khởi tạo JS thủ công, chỉ cần chèn script vào cuối file HTML.

```html
<!-- 1. Chuẩn bị Layout HTML -->
<div class="page-container">
  <!-- Cụm chức năng lọc và lưu -->
  <div id="filterMaBangContainer"></div>
  <button id="btnSaveChanges" style="display: none;">Lưu thay đổi</button>
  
  <!-- Khu vực hiển thị lưới -->
  <table id="dataTable"><thead></thead><tbody></tbody></table>
  <div id="tablePagination"></div>
</div>

<!-- 2. Nhúng Script -->
<script src="/static/js/api/admin/danhMucTruongDuocSuDungApi.js"></script>
<script src="/static/js/components/datatable.js"></script>
<script src="/static/js/components/combo_box.js"></script>
<script src="/static/js/pages/admin/danh_muc_truong_duoc_su_dung.js"></script>

<!-- 3. Mô phỏng luồng chạy ngầm của file js -->
<script>
  // Kịch bản tự động chạy khi trang load xong qua DOMContentLoaded:
  // 1. Tải danh sách bảng đổ vào ComboBox.
  // 2. Chờ người dùng chọn "Bảng Giáo Viên".
  // 3. Gọi DataTable vẽ lưới.
  // 4. Nếu người dùng Double Click sửa cột "Họ Tên", biến `modifiedRows` sẽ lưu giá trị mới, 
  //    nút #btnSaveChanges tự động hiện ra.
</script>
```

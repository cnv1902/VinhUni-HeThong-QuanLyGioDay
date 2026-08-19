# Tài liệu Component: Page - Nhóm Công Thức Quy Đổi

**Đường dẫn:** `static/js/pages/admin/nhom_cong_thuc_quy_doi.js`

Đây là Page-Level Component (Mã nguồn cấp độ trang) chịu trách nhiệm quản lý màn hình "Nhóm công thức quy đổi". Điểm đặc biệt của trang này là nó tích hợp gần như toàn bộ các UI Components phức tạp nhất của hệ thống: `DataTable`, `ComboBox`, `TagInput`, `BaseModal`, `ConfirmModal`, `TableConfigModal` và `SemanticEditorDrawer`.

## 1. Tham số khởi tạo (Inputs)

File JS này hoạt động dưới dạng kịch bản thủ tục (Procedural Script), tự động chạy hàm `init()` ngay khi file được tải mà không cần khởi tạo qua Class.

Trang này thiết lập sẵn các biến toàn cục để quản lý State chung:
* `myTable`: Tham chiếu đến bảng DataTable lưới chính.
* `formModal`: Quản lý hộp thoại Thêm/Sửa (kế thừa BaseModal).
* `cbHeDaoTao` & `tagHinhThucHoc`: Quản lý các Input đặc thù trong Form.
* `semanticEditor`: Tham chiếu đến Drawer mở rộng cấu hình công thức.
* `editingId`: Lưu lại ID khi người dùng bấm Sửa (Nếu bằng `null` nghĩa là đang Thêm mới).

## 2. Các hàm chức năng (Methods)

Trang này cấu trúc mã nguồn theo các hàm chức năng chính:

* **`init()`**: Hàm khởi động, cấu hình khung DataTable (chỉ gọi `setColumns`), vẽ Footer và gọi tiếp các hàm khởi tạo khác.
* **`initFormModal()`**: Gọi API kéo danh sách Hệ Đào Tạo, Hình Thức Học đổ vào `ComboBox` và `TagInput`. Đồng thời bọc sự kiện `submit` form để Validation và lưu dữ liệu.
* **`loadTableData()`**: Tải lại dữ liệu chính của bảng. Hàm này quét thêm giá trị ở các bộ lọc (Dropdown Ngoài lưới) như `#filterHeDaoTao`, `#filterTrangThai` để truyền lên API.
* **`bindStaticEvents()`**: Nơi tập trung toàn bộ Event Listeners tĩnh (Nút Tìm kiếm nhanh, Nút Thêm mới, Nút Cấu hình, và Event Delegation cho các nút Sửa/Xóa bên trong bảng).
* **`updateFooter(rows, selectedSet)`**: Cập nhật lại số liệu đếm dòng dưới góc màn hình.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Event Delegation (Ủy quyền sự kiện):** Với các nút thao tác bên trong bảng (Cấu hình, Sửa, Xóa), thay vì gắn sự kiện cho từng dòng, Component gắn 1 listener duy nhất vào thẻ `myTable.tbody`. Nhờ hàm `e.target.closest('[data-action]')`, nó trích xuất lệnh tương ứng:
   * Chế độ **edit**: Điền thông tin vào form, gọi `tagHinhThucHoc.addTag(...)` và `cbHeDaoTao.setValue(...)`, rồi mở Modal.
   * Chế độ **delete**: Hiện `confirmModal.show()`, nếu OK thì gọi API xóa.
   * Chế độ **config**: Chuyển quyền xử lý cho `semanticEditor.open(id)`.
2. **Form Validation & Submission:** Trong hàm `submit`, mã nguồn gom dữ liệu bằng `FormData`, ép kiểu lại dữ liệu (`parseInt`, boolean `true/false`) và gọi API Tùy biến (Create/Update phụ thuộc vào biến cờ `editingId`). Toàn bộ quá trình gọi API chặn việc bấm nhiều lần bằng cờ `btnSubmit.disabled = true`.
3. **Thống kê Footer Động:** Bảng lưới phản hồi trực tiếp trạng thái `onSelectionChange` và `onRenderComplete` bằng cách gọi hàm `updateFooter()`.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:**
  * Vẽ cấu trúc lưới vào thẻ `#dataTable`.
  * Thay đổi cấu trúc HTML trong thẻ `.app-footer` qua hàm `renderFooterUI`.
  * Làm mới `#formNhomCongThuc` mỗi khi mở/đóng Modal.
* **Sự kiện xuất (Output Events):** Component làm chức năng quản lý cục bộ (Page Controller), nó điều khiển các thẻ DOM và giao tiếp trực tiếp với Backend (qua `apiCongThuc`), **không** trigger các Custom Event gửi ra ngoài.

## 5. Ví dụ thực tế (Usage Example)

Cách nhúng và mô phỏng luồng hoạt động của trang:

```html
<!-- 1. Layout cơ bản của Trang -->
<div class="page-container">
  <!-- Thanh công cụ (Bộ lọc & Nút bấm) -->
  <div class="toolbar">
    <select id="filterHeDaoTao"></select>
    <button id="btnNewGrounp">Thêm mới</button>
  </div>
  
  <!-- Bảng chính -->
  <table id="dataTable"><thead></thead><tbody></tbody></table>
  
  <!-- Hộp thoại Form Thêm mới/Sửa ẩn -->
  <div id="modalNhomCongThuc" class="modal">
    <form id="formNhomCongThuc">
      <div id="heDaoTaoContainer"></div>
      <div id="dsHinhThucHocContainer"></div>
      <button type="submit">Lưu</button>
    </form>
  </div>
  
  <!-- Chân trang thống kê -->
  <footer class="app-footer"></footer>
</div>

<!-- 2. Nhúng Script -->
<script src="/static/js/api/admin/congThucApi.js"></script>
<!-- (Phải nhúng trước toàn bộ Component Utils như DataTable, ComboBox, Modal...) -->
<script src="/static/js/pages/admin/nhom_cong_thuc_quy_doi.js"></script>

<!-- 3. Luồng chạy thực tế -->
<script>
  // File JS sẽ tự chạy hàm init():
  // Bước 1: Render Footer.
  // Bước 2: Tạo DataTable nhưng chưa có dòng nào.
  // Bước 3: Lấy API đổ vào filterHeDaoTao, khởi tạo ComboBox & TagInput.
  // Bước 4: Gọi loadTableData() để lấp đầy bảng.
  // Khi người dùng ấn nút [data-action="delete"] trên một dòng, 
  // Sự kiện sẽ sủi bọt lên tbody, kích hoạt confirmModal và gọi API xóa.
</script>
```

# Tài liệu Component: DataTable

**Đường dẫn:** `static/js/components/datatable.js`

DataTable là Component lớn và phức tạp nhất của hệ thống, quản lý việc hiển thị lưới dữ liệu với hàng loạt tính năng như: Lọc (Excel-like Filter), Sắp xếp, Phân trang, Incremental Render (Lazy load khi cuộn), Resize (Co giãn cột) và Sửa nhanh trực tiếp (Inline Edit).

## 1. Tham số khởi tạo (Inputs)

Khởi tạo bảng bằng lệnh `new DataTable(config)`. Trong đó `config` là một Object chứa các tùy chọn:

* **Basic:**
  * `tableId` (string): ID của thẻ `<table>` chứa dữ liệu (Bắt buộc).
  * `paginationId` (string): ID của khu vực hiển thị các nút phân trang.
  * `pageSize` (number): Số dòng tối đa trên một trang. Mặc định 100.
  * `enablePagination` (boolean): Bật/Tắt phân trang truyền thống.
* **Incremental Render (Lazy Load Cục bộ):**
  * `incrementalRender` (boolean): Chuyển sang chế độ vẽ từng lô dòng khi cuộn chuột.
  * `incrementalBatchSize` (number): Số dòng sẽ vẽ thêm trong mỗi lô.
* **Features:**
  * `resizableColumns` (boolean): Bật tính năng kéo độ rộng cột.
  * `storageKey` (string): Khóa lưu đệm chiều rộng cột trên LocalStorage.
  * `rowKey` (string): Tên trường dùng làm khóa chính định danh mỗi dòng (VD: `id`, `MaNhomLopHP`).
* **Logic/Hooks:**
  * `isRowSelectable`, `isRowEditable` (Functions): Các hàm xác định một dòng có được phép chọn/sửa hay không.
  * `customCellRender`, `getCellEditorOptions` (Functions): Callback ghi đè giao diện ô hoặc tải danh sách Dropdown khi click đúp sửa ô.
  * `onRowDirty`, `onSelectionChange`, `onRenderComplete` (Functions): Các sự kiện phản hồi ngược lại ra ngoài.

## 2. Các hàm chức năng (Methods)

* **`setData(data)`**: Nạp mảng dữ liệu gốc dạng Array Object vào bảng. Reset trạng thái trang, bộ lọc và tiến hành render toàn bộ lưới.
* **`setColumns(colsConfig, rawColumns)`**: Nạp mảng cấu hình các cột.
* **`updateRowsData(updatedRows, primaryKey)`**: Hàm tối ưu hóa (Patch Update). Cập nhật đè dữ liệu mới cho 1 số dòng cụ thể mà không cần `setData` lại toàn bộ bảng.
* **`setSearch(keyword)`**: Đặt từ khóa tìm kiếm nhanh trên tất cả các cột.
* **`getRows()`**: Lấy danh sách các dòng dữ liệu hợp lệ (sau khi đã Lọc và Sắp xếp).

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Event Delegation (Tối ưu hóa sự kiện):** Vì bảng có thể chứa hàng ngàn dòng, mọi sự kiện Click, Double Click, Change đều không gắn vào từng thẻ `<input>` hay `<td>`. Thay vào đó, chúng được gắn duy nhất vào thẻ `<tbody>` và `<thead>`, thông qua hàm `closest()` để biết thẻ con nào vừa bị tác động.
2. **Incremental Render (Intersection Observer):** Nếu tắt phân trang và dữ liệu quá dài, Component tự động cắm một thẻ `<div class="incremental-trigger">` ở dòng cuối bảng. Dùng API `IntersectionObserver`, khi người dùng cuộn đến đáy bảng, nó tự động gọi hàm `appendNextIncrementalBatch()` để vẽ thêm các dòng tiếp theo mà không gây đơ trình duyệt.
3. **Inline Edit (Sửa trực tiếp):** Bắt sự kiện `dblclick` lên thẻ `td`. Biến nội dung HTML thành 1 input hoặc select (lấy qua `getCellEditorOptions`). Theo dõi sự kiện `blur` hoặc nhấn `Enter/Esc` để lưu (commit) dữ liệu và kích hoạt callback `onRowDirty`.
4. **Resizing State:** Khi người dùng giữ chuột ở mép cột (Resize handle), component tạo ra một thanh gióng mờ (`col-resize-guide`), tính toán tọa độ trục X (`clientX`) để tăng giảm độ rộng của cột. Khi nhả chuột (`mouseup`), thông số lưu luôn xuống bộ nhớ tạm.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Manipulation:** Component sở hữu toàn quyền sinh/sửa/xóa cấu trúc HTML bên trong vùng thẻ `<tbody>` và `<thead>` được định danh qua ID cấp cho `tableId`, cũng như tự động sinh nút ở khu vực `paginationId`. Trong quá trình Lọc, một thẻ div ảo sẽ được append trực tiếp ra ngoài `body`.
* **Events / Output Data:** 
  * Không phát ra CustomEvent. Mọi tác vụ được giao tiếp ngầm qua bộ 3 callback: `onRowDirty(row, colId, val)`, `onSelectionChange(set)`, `onRenderComplete()`.
  * Trạng thái độ rộng cột và STT của người dùng tự động lưu ngầm dưới dạng JSON Text vào hệ thống `window.localStorage` dựa trên tiền tố `storageKey`.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// 1. Chuẩn bị DOM
// <table id="myTable"><thead></thead><tbody></tbody></table>
// <div id="myPagination"></div>

// 2. Khởi tạo Component
const myDataTable = new DataTable({
  tableId: 'myTable',
  paginationId: 'myPagination',
  pageSize: 50,
  rowKey: 'MaNhomLopHP',
  // Các hàm callback (Hooks)
  isRowEditable: (row) => row.TrangThai !== 'Đã chốt',
  onRowDirty: (row, colId, newValue) => {
    console.log(`Dòng ${row.MaNhomLopHP} vừa sửa cột ${colId} thành ${newValue}`);
  },
  onSelectionChange: (selectedSet) => {
    console.log("Các dòng đang chọn:", Array.from(selectedSet));
  }
});

// 3. Truyền dữ liệu và cấu hình cột
const mockColumns = [
  { MaTruong: "MaNhomLopHP", TenTruong: "Mã Lớp", HienThi: true, DoRong: 120 },
  { MaTruong: "TrangThai", TenTruong: "Trạng Thái", HienThi: true, DoRong: 150, KieuTruong: "badge" }
];
const mockData = [
  { MaNhomLopHP: "L01", TrangThai: "Đang mở" },
  { MaNhomLopHP: "L02", TrangThai: "Đã chốt" }
];

myDataTable.setColumns(mockColumns);
myDataTable.setData(mockData);

// 4. Update data cục bộ (Patch)
document.getElementById('btnQuickUpdate').addEventListener('click', () => {
  myDataTable.updateRowsData([{ MaNhomLopHP: "L01", TrangThai: "Đã chốt" }]);
});
```

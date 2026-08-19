# Tài liệu Component: Table Config

**Đường dẫn:** `static/js/components/tableConfig.js`

TableConfigModal là một Component dưới dạng Singleton Module (IIFE - Immediately Invoked Function Expression), quản lý toàn bộ vòng đời của Hộp thoại "Cấu hình hiển thị cột" trên các trang Datatable. 

## 1. Tham số khởi tạo (Inputs)

Vì đây là Singleton, bạn không khởi tạo bằng `new ClassName()`. Thay vào đó, gọi trực tiếp từ biến toàn cục: `TableConfigModal.open(storageKey, originalColumns, callback)`.

**Tham số truyền vào:**
* **`storageKey`** (string): Khóa định danh dùng để lưu và đọc dữ liệu từ `localStorage` (Ví dụ: `"HETHONG_NhomCongThuc_Cols"`).
* **`originalColumns`** (Array): Mảng cấu hình các cột nguyên gốc trả về từ Backend API. Mỗi cột có các trường `MaTruong`, `TenTruong`, `HienThi`, `CanLe`, `DoRong`, `ThuTuHienThi`.
* **`callback`** (Function): Hàm callback thực thi khi người dùng nhấn nút "Lưu" (Save). Truyền kèm mảng cấu hình `editingColumns` mới.

## 2. Các hàm chức năng (Methods)

Các hàm public Component bộc lộ ra ngoài (return từ khối IIFE):

* **`open(storageKey, originalColumns, callback)`**: Khởi động, tải dữ liệu cấu hình đã lưu và mở hiển thị giao diện Modal.
* **`mergeConfig(storageKey, apiColumns)`**: Thuật toán trộn cấu hình ưu tiên (Deep Merge). Lấy cấu hình gốc từ API và ghi đè những thuộc tính người dùng đã tùy biến lưu trong `localStorage` lên trên. Trả về mảng đã đồng bộ hóa.

*(Các hàm nội bộ quan trọng: `renderTable()`, `autoFitColumns()`, `saveConfig()`, `resetConfig()`)*

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Khởi tạo (init):** Khi trang vừa tải (`DOMContentLoaded`), component sẽ tự động quét DOM tìm các thẻ tĩnh (overlay, tbody, các nút save/close) có ID cố định như `tableConfigModalOverlay` và lưu tham chiếu.
2. **Xử lý State:** Khi bấm mở, hàm `mergeConfig` sẽ thực thi, kết quả đưa vào mảng trung gian `editingColumns`. Mảng này được sắp xếp lại (`sort`) theo `ThuTuHienThi` để chắc chắn thứ tự là chuẩn xác nhất.
3. **Render & Tương tác DOM:**
   * **Vẽ bảng:** Dùng thuộc tính `innerHTML` sinh ra từng dòng cấu hình (Tên cột, Ẩn/Hiện, Độ rộng, Căn lề, Nút Lên/Xuống).
   * **Reorder (Đảo thứ tự):** Ứng dụng Event Delegation vào nút "Lên", "Xuống". Trước khi hoán đổi (Swap) vị trí của hai object liền kề trong mảng `editingColumns`, component phải gọi hàm `syncFormDataToState()` để thu thập toàn bộ Textbox/Checkbox vừa gõ vào bộ nhớ, tránh tình trạng swap làm mất dữ liệu người dùng đang nhập dở.
   * **AutoFit (Tính độ rộng):** Dùng tính năng ảo `CanvasRenderingContext2D.measureText()` vẽ vô hình dòng chữ của Tên Cột ra bộ nhớ tạm (Canvas) để tính toán ra chính xác độ rộng (pixel) cực kỳ mượt mà, sau đó +82px padding để ra kết quả AutoFit cho từng cột.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Update:**
  * Thay đổi thuộc tính `display: flex/none` của thẻ div `#tableConfigModalOverlay`.
  * Liên tục ghi đè nội dung của bảng `#tableConfigBody` bên trong Modal.
* **Trạng thái lưu trữ:** Ghi đè chuỗi JSON vào hệ thống `window.localStorage` khi lưu, và dùng `localStorage.removeItem()` khi nhấn "Khôi phục mặc định".
* **Events:** Phát ra output thông qua hàm callback `onSaveCallback(editingColumns)`. Khi gọi chức năng Khôi phục, Component sử dụng hàm `window.location.reload()` ép trang làm mới để tẩy trắng toàn bộ config lưu đệm.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// TableConfigModal hoạt động dạng Singleton nên không cần khởi tạo `new`.

// 1. Chuẩn bị mảng cấu hình nguyên gốc (từ Backend API)
const apiColumns = [
  { MaTruong: "MaSV", TenTruong: "Mã Sinh Viên", HienThi: true, DoRong: 100 },
  { MaTruong: "HoTen", TenTruong: "Họ và Tên", HienThi: true, DoRong: 200 }
];

// 2. Mở Modal Cấu Hình
document.getElementById('btnOpenConfig').addEventListener('click', () => {
  
  // Gọi hàm open() với 3 tham số:
  // - storageKey: Khóa lưu localStorage
  // - apiColumns: Cấu hình gốc
  // - callback: Hàm chạy sau khi user nhấn Lưu
  TableConfigModal.open('MY_TABLE_CONFIG', apiColumns, (newConfig) => {
    
    console.log("Người dùng vừa lưu cấu hình mới:", newConfig);
    
    // Đẩy cấu hình mới vào Datatable để vẽ lại
    // dataTable.setColumns(newConfig);
    
  });
});
```

# Tài liệu Component: Semantic Editor

**Đường dẫn:** `static/js/components/semantic_editor.js`

SemanticEditor (Drawer) là một Component dạng Modal trượt (Ngăn kéo/Drawer) dùng riêng cho việc Cấu hình các công thức và mốc hệ số tính toán (Hệ số lớp đông, Trường hợp dạy). Nó chứa bên trong các bảng tính động và các text editor có hỗ trợ nhắc lệnh (như tích hợp FormulaBuilder dạng nhẹ).

## 1. Tham số khởi tạo (Inputs)

Khởi tạo Component bằng lệnh `new SemanticEditorDrawer(drawerId)`

* **`drawerId`** (string): ID của thẻ HTML chứa layout ngăn kéo (Ví dụ: `"configDrawer"`). Thẻ này phải có sẵn các class và phân khu tương ứng theo thiết kế.

## 2. Các hàm chức năng (Methods)

* **`open(groupId, groupName)`**: Mở ngăn kéo lên. Gắn ID của nhóm công thức đang cấu hình và gọi API nạp dữ liệu (Lazy load).
* **`close()`**: Đóng nhanh ngăn kéo bằng cách gỡ class CSS, không hỏi xác nhận.
* **`handleClose()`**: Gọi khi ấn nút X. Sẽ kiểm tra trạng thái (Dirty State), nếu có thay đổi chưa lưu sẽ bật `confirmModal` hỏi người dùng trước khi đóng.
* **`saveConfig()`**: Thu thập toàn bộ dữ liệu đang sửa, chuẩn hóa và gửi PUT request qua `apiSemanticEditor` để lưu.
* **`checkIsDirty()`**: Hàm nội bộ kiểm tra xem dữ liệu trên UI đã bị thay đổi so với dữ liệu nguyên gốc (`originalData`) hay chưa.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Lazy Loading:** Khi mở Drawer, component sẽ nạp danh sách "Trường hợp công thức". Khi click qua tab "Hệ số lớp đông", hàm `lazyLoadHeSoLopDong()` mới được gọi để tiết kiệm băng thông.
2. **Quản lý Menu Động (Tab Navigation):** Menu bên trái hiển thị cố định tab "Hệ số lớp đông" và render động các tab "Trường hợp công thức" bằng `renderMenu()`. Cập nhật `activeMenuId` và render lại nội dung Detail qua `renderDetailView()` khi người dùng nhấp.
3. **Chỉnh sửa mốc/hệ số (Grid Editor):** Ở tab nội dung chi tiết, Component sử dụng thẻ `textarea` và các `input number` dạng Grid. Ban đầu nó gán cờ `readonly`. Nếu ấn nút "Sửa", cờ này bị gỡ ra.
4. **Data Binding Thủ công:** Bắt sự kiện `input` trên toàn bộ bảng (`Event Delegation`). Khi gõ, tìm dòng/cột tương ứng thông qua các thuộc tính data như `data-gindex`, `data-rindex` rồi lưu trực tiếp vào mảng state bộ nhớ `this.fullHeSoData` hoặc `this.truongHopData`. Đồng thời tô màu class `is-dirty` cho dòng bị sửa.
5. **Semantic Translation:** Có sẵn các hàm `toSemanticText` (dịch `[MA_SO]` thành `[Hiển thị]`) và ngược lại `toRawText`. Quá trình người dùng thao tác sẽ tự động gọi hàm render preview ngay bên dưới.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Manipulation:** 
  * Cập nhật class `.active` cho thẻ Drawer. Thêm class `.semantic-drawer-open` cho `document.body` để chặn thanh cuộn của trang nền.
  * Liên tục ghi đè nội dung của `#menuDynamic` và `#detailContent`.
* **Events / Data Out:** Tự động gọi API `bulkUpdateHeSoLopDong` hoặc `bulkUpdateTruongHopNhomCongThuc` qua module `apiSemanticEditor` để lưu trữ, không ném dữ liệu ngược lại. Nếu thay đổi, có thể người dùng cần chủ động reload bảng bên ngoài.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// 1. Khởi tạo Drawer (gọi 1 lần duy nhất lúc tải trang)
const semanticEditor = new SemanticEditorDrawer('configDrawer');

// 2. Lắng nghe sự kiện click từ một bảng hoặc nút bên ngoài
document.getElementById('myTable').addEventListener('click', (e) => {
  const btnConfig = e.target.closest('.mini-btn-config');
  if (btnConfig) {
    const groupId = btnConfig.dataset.id;
    const groupName = "Nhóm Công thức A";
    
    // Gọi hàm open() truyền vào ID và tên để Drawer tự tải dữ liệu
    semanticEditor.open(groupId, groupName);
  }
});

// Lưu ý: Các nút Lưu/Đóng bên trong Modal Drawer đã được
// SemanticEditorDrawer tự gắn event lắng nghe bên trong file JS của nó.
```

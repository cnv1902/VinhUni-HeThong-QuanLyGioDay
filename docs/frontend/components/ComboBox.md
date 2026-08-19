# Tài liệu Component: ComboBox

**Đường dẫn:** `static/js/components/combo_box.js`

ComboBox là một UI Component dùng để thay thế cho thẻ `<datalist>` hoặc `<select>` mặc định của trình duyệt. Nó cung cấp chức năng chọn từ danh sách (Single-select Autocomplete) với ô tìm kiếm tích hợp.

## 1. Tham số khởi tạo (Inputs)

Khi khởi tạo Component bằng lệnh `new ComboBox(containerSelector, options)`, bạn cần truyền vào các tham số sau:

* **`containerSelector`** (string): Bộ chọn CSS của thẻ div chứa ComboBox (ví dụ: `"#myComboBox"`).
* **`options`** (Object): Đối tượng cấu hình bao gồm:
  * `data` (Array): Mảng chứa dữ liệu danh sách tùy chọn. Định dạng: `[{ id: 1, text: "Tùy chọn 1" }, ...]`.
  * `fieldName` (string): Thuộc tính `name` của thẻ input ẩn (hidden input) dùng để submit form. Mặc định: `"ComboBoxHidden"`.
  * `placeholder` (string): Chữ mờ hiển thị khi ô nhập trống. Mặc định: `"Chọn..."`.
  * `defaultValue` (any): ID của phần tử được chọn mặc định ban đầu. Mặc định: `null`.

## 2. Các hàm chức năng (Methods)

Các hàm public dùng để tương tác từ bên ngoài:

* **`setValue(id)`**: Chọn một giá trị trong danh sách dựa vào `id`. Tự động cập nhật chữ hiển thị lên giao diện.
* **`getValue()`**: Trả về `id` của giá trị đang được chọn.
* **`showDropdown(query)`**: Mở dropdown và lọc danh sách tùy chọn có chứa chuỗi `query` (không phân biệt hoa thường).
* **`hideDropdown()`**: Đóng dropdown.
* **`clear()`**: Xóa trắng giá trị đang chọn. Đặt text và id về rỗng.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Render UI:** Component tự động chèn 1 thẻ `<input type="text">` (để gõ tìm kiếm) và 1 thẻ `<input type="hidden">` (lưu ID) vào `containerSelector`.
2. **Quản lý Dropdown tách rời:** Để tránh lỗi CSS (như bị che khuất bởi thẻ cha có `overflow: hidden`), thẻ danh sách thả xuống (`dropdownMenu`) được tạo riêng biệt bằng `document.createElement('div')` và chỉ được `appendChild` trực tiếp vào thẻ `<body>` hoặc `.modal-overlay` khi hiển thị.
3. **Tính toán tọa độ:** Khi gọi hàm show, component sử dụng `getBoundingClientRect()` để đo đạc vị trí của ô nhập. Nếu không gian phía dưới không đủ (`spaceBelow < menuHeight`), nó sẽ tự động tính toán để hất danh sách lên trên (dropup) thay vì thả xuống.
4. **Gắn sự kiện (Event Listeners):** Lắng nghe các sự kiện `focus`, `click`, `input` để lọc dữ liệu theo thời gian thực. Bắt sự kiện phím `Enter` để chọn mục đầu tiên. Lắng nghe sự kiện `click` và `scroll` trên `document` để tự động đóng dropdown khi nhấn ra ngoài.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Manipulation:** Cập nhật trực tiếp chuỗi text hiển thị vào ô `<input type="text">`. Quan trọng nhất, giá trị `id` được chọn sẽ được gán tự động vào thẻ `<input type="hidden" name="${fieldName}">`. Điều này cho phép form HTML thông thường vẫn lấy được dữ liệu khi Submit (`FormData`).
* **Events:** Component này hoạt động nội bộ khép kín, nó **không trigger (phát ra)** bất kỳ Custom Event nào ra bên ngoài. Người dùng muốn lấy giá trị phải chủ động gọi hàm `combo_box.getValue()`.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// 1. Chuẩn bị dữ liệu giả lập (mock data)
const mockData = [
  { id: 1, text: "Lý thuyết" },
  { id: 2, text: "Thực hành" },
  { id: 3, text: "Đồ án" }
];

// 2. Khởi tạo Component
const loaiHocPhanCombo = new ComboBox('#loaiHocPhanContainer', {
  data: mockData,
  fieldName: 'IDLoaiHocPhan', // Tên biến submit form
  placeholder: 'Chọn loại học phần...',
  defaultValue: 2 // Tự động chọn "Thực hành"
});

// 3. Tương tác thực tế
document.getElementById('btnSubmit').addEventListener('click', () => {
  const selectedId = loaiHocPhanCombo.getValue();
  if (!selectedId) {
    alert("Vui lòng chọn loại học phần!");
    return;
  }
  console.log("Đang submit ID:", selectedId);
});

// Nút reset
document.getElementById('btnReset').addEventListener('click', () => {
  loaiHocPhanCombo.clear();
});
```

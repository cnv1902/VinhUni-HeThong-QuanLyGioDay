# Tài liệu Component: Tag Input

**Đường dẫn:** `static/js/components/tag_input.js`

TagInput là một UI Component phức tạp dùng để quản lý ô nhập liệu chọn nhiều phần tử (Multi-select) với giao diện dạng "Thẻ" (Tags). Nó tích hợp sẵn ô tìm kiếm thả xuống (Dropdown/Autocomplete).

## 1. Tham số khởi tạo (Inputs)

Khi khởi tạo Component bằng lệnh `new TagInput(containerSelector, options)`, bạn truyền vào:

* **`containerSelector`** (string): Bộ chọn CSS của thẻ div chứa Component.
* **`options`** (Object): Đối tượng cấu hình bao gồm:
  * `data` (Array): Mảng chứa dữ liệu các tùy chọn. Định dạng: `[{ id: 1, text: "Lý thuyết" }, ...]`.
  * `fieldName` (string): Thuộc tính `name` cho thẻ input ẩn dùng để submit dữ liệu form. Mặc định là `"TagInputHidden"`.
  * `placeholder` (string): Chữ hiển thị mờ trong ô nhập. Mặc định là `"Thêm..."`.

## 2. Các hàm chức năng (Methods)

Các hàm public bộc lộ để tương tác từ bên ngoài:

* **`clear()`**: Xóa trắng toàn bộ dữ liệu thẻ đang chọn và reset text trong ô tìm kiếm.
* **`getValue()`**: Trả về dữ liệu đã chọn dưới dạng chuỗi ID được phân cách bằng dấu phẩy (VD: `,1,3,5,`).
* **`getValues()`**: Trả về mảng các Object chi tiết của các thẻ đã chọn (VD: `[{id: 1, text: "A"}]`).
* **`addTag(id, text)`**: Lệnh API nội bộ/public để ép chèn thêm một thẻ (tag) vào giao diện.
* **`removeTag(id)`**: Lệnh gỡ bỏ một thẻ dựa theo id.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Render Initial UI:** Tự động chèn vùng hiển thị danh sách thẻ `.tag-list`, một thẻ nhập `.tag-input-field` để gõ tìm kiếm, và một thẻ `.tag-dropdown-menu` rời rạc để hiển thị kết quả.
2. **Xử lý Dropdown Tách rời:** Để danh sách thả xuống không bị kẹt bên trong thẻ cha bị cắt nội dung (`overflow: hidden` của Table hay Modal), thẻ dropdown được `appendChild` thẳng vào thẻ `body` hoặc `.modal-overlay`. Kích thước và tọa độ top/left của nó được tính bằng hàm `getBoundingClientRect()` của ô nhập liệu gốc.
3. **Event Listeners:** 
   * Lắng nghe sự kiện gõ `input` để lọc kết quả hiển thị tự động.
   * Lắng nghe phím `Backspace` trên thẻ input: Nếu ô nhập đang trống chữ, nhấn nút Backspace sẽ gọi hàm `removeLastTag()` để xóa đi thẻ tag nằm cuối cùng.
   * Bắt phím `Enter` để chọn nhanh kết quả đầu tiên.
   * Bắt sự kiện cuộn chuột (`scroll`) hoặc nhấp chuột ngoài vùng hiển thị (`click outside`) để lập tức đóng cửa sổ dropdown.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Manipulation:** Tự động sinh thẻ hiển thị bên trong `.tag-list`. Quan trọng nhất, mỗi khi số lượng thẻ bị thay đổi (thêm/xóa), Component tự động gọi `updateUI()` để cập nhật thẻ `<input type="hidden">`.
* **Output Format:** Giá trị gán vào input ẩn được bao bọc bởi 2 dấu phẩy ở đầu và cuối (VD: `,1,2,5,`). Thiết kế này nhằm hỗ trợ Backend dùng các truy vấn SQL như `LIKE '%,2,%'` cực kỳ chính xác.
* **Events:** Component này khép kín, nó **không phát ra** các Custom Event ra bên ngoài. Lấy dữ liệu qua các hàm Get nội bộ.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// 1. Chuẩn bị dữ liệu mock
const skillsData = [
  { id: 'js', text: 'JavaScript' },
  { id: 'py', text: 'Python' },
  { id: 'sql', text: 'SQL Server' }
];

// 2. Khởi tạo Component
const skillsInput = new TagInput('#skillsTagContainer', {
  data: skillsData,
  fieldName: 'DsKyNang', // Input hidden sẽ có dạng ,js,py,
  placeholder: 'Gõ để tìm ngôn ngữ...'
});

// 3. Gọi hàm public
// Thêm thủ công bằng API
skillsInput.addTag('js', 'JavaScript'); 

document.getElementById('btnSave').addEventListener('click', () => {
  // Lấy ra chuỗi format sẵn cho Backend
  const rawValue = skillsInput.getValue(); // Ví dụ: ",js,sql,"
  console.log("Lưu vào CSDL:", rawValue);
  
  // Lấy ra mảng object thực tế để xử lý JS
  const arrValues = skillsInput.getValues(); 
  console.log("Danh sách đã chọn:", arrValues);
});

// Khi đóng modal thêm mới
skillsInput.clear();
```

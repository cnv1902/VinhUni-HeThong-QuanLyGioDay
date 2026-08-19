# Tài liệu Component: Formula Builder

**Đường dẫn:** `static/js/components/formula_builder.js`

FormulaBuilder là một Component UI chuyên dụng hỗ trợ việc nhập liệu công thức toán học một cách trực quan. Component cung cấp các nút nhấn để chèn biến số/toán tử nhanh chóng, đi kèm với khả năng "dịch" (Semantic Translation) công thức từ mã máy sang ngôn ngữ tự nhiên ngay trong lúc gõ (Real-time Preview).

## 1. Tham số khởi tạo (Inputs)

Khởi tạo Component thông qua cú pháp `new FormulaBuilder(container, options)`.

* **`container`** (string | HTMLElement): Truyền vào CSS Selector (VD: `"#myFormulaBox"`) hoặc chính thẻ DOM cần nhúng Component vào.
* **`options`** (Object):
  * `dictionary` (Array): Mảng từ điển cấu hình biến số. Cấu trúc mỗi phần tử: `{ key: "[HESO_1]", label: "Hệ số một" }`.
  * `initialValue` (string): Công thức khởi tạo ban đầu dưới dạng chuỗi thô (Raw string).
  * `onChange` (Function): Callback kích hoạt mỗi khi nội dung bị thay đổi. Cấu trúc: `(rawValue, semanticValue) => {}`.

## 2. Các hàm chức năng (Methods)

Các hàm public phục vụ cho việc tương tác:

* **`insertTextAtCursor(text, offset)`**: Tự động chèn đoạn văn bản `text` vào đúng vị trí con trỏ chuột hiện hành trong Textarea. Tham số `offset` dùng để lùi vị trí con trỏ (ví dụ sau khi chèn hàm `IF( , , )`, lùi vào giữa dấu ngoặc).
* **`clear()`**: Xóa sạch hoàn toàn chuỗi công thức hiện tại và kích hoạt render lại giao diện trống.
* **`buildSemanticValue(raw)`**: Nhận vào chuỗi thô, trả về chuỗi đã được "dịch" dựa trên cấu hình `dictionary`.

## 3. Quá trình Xử lý (Process & DOM Manipulation)

1. **Render UI:** Khi khởi tạo, Component ghi đè nội dung của `container` bằng hai phân khu: Toolbar (chứa nút Bấm) và Editor (chứa Textarea và vùng Preview). Component chủ động lưu lại tham chiếu của `textarea` và `previewContent` để tối ưu hóa render.
2. **Translation Logic (Regex):** Khi biến đổi chuỗi thô (ví dụ: `[HESO] * 2`) thành chuỗi đọc hiểu (ví dụ: `[Hệ số] * 2`), component sử dụng Biểu thức chính quy (Regex) với từ khóa `\b` (Word boundary) để đảm bảo không thay thế nhầm các biến có tên gần giống nhau.
3. **Event Delegation:** Toàn bộ thanh Toolbar không gắn sự kiện cho từng nút, mà gán một listener `click` duy nhất ở cha. Khi click, dò tìm xem phần tử con nào có class `.fb-btn` được nhấn. Trích xuất thuộc tính `data-insert` và `data-offset` để thực hiện hàm `insertTextAtCursor`.
4. **Trạng thái trỏ chuột (Caret Position):** Bắt chính xác tọa độ con trỏ thông qua `selectionStart` và `selectionEnd` của Textarea, thực hiện phép nối chuỗi (Substring) và dùng hàm `setSelectionRange()` để đặt lại trỏ chuột một cách mượt mà.

## 4. Kết quả đầu ra (Output / Events)

* **DOM Manipulation:** Component chỉnh sửa class của div cha (thêm `formula-builder-wrapper`), đổ cấu trúc HTML động vào bên trong `container`. Liên tục cập nhật chữ vào thẻ `.fb-preview-content`.
* **Events:**
  * Component tự động đồng bộ (Two-way binding) khi người dùng gõ phím trực tiếp vào Textarea (`input` event) hoặc nhấn nút qua Toolbar.
  * Không phát CustomEvent. Hệ thống giao tiếp ra ngoài bằng cách gọi liên tục hàm `options.onChange(rawValue, semanticValue)` được đăng ký lúc đầu.

## 5. Ví dụ thực tế (Usage Example)

```javascript
// 1. Khai báo từ điển biến số
const dict = [
  { key: "[SISO]", label: "Sĩ số lớp" },
  { key: "[HESO_K]", label: "Hệ số K" }
];

// 2. Khởi tạo Component (Gắn vào thẻ <div id="formulaContainer"></div>)
const builder = new FormulaBuilder('#formulaContainer', {
  dictionary: dict,
  initialValue: "[SISO] * 1.5",
  onChange: (raw, semantic) => {
    // Sẽ chạy mỗi khi user gõ hoặc bấm nút
    console.log("Lưu DB:", raw); // "[SISO] * 1.5"
    console.log("Hiển thị user:", semantic); // "[Sĩ số lớp] * 1.5"
    
    // Gán vào một thẻ input ẩn để submit form
    document.getElementById('hiddenFormulaValue').value = raw;
  }
});

// 3. Nút bấm xóa trắng
document.getElementById('btnClear').addEventListener('click', () => {
  builder.clear();
});
```

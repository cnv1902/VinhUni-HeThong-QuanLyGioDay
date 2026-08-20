# Đặc tả Trang: Phân Quyền Xác Nhận Khối Lượng Giảng Dạy

**Đường dẫn:** `static/js/pages/admin/phan_quyen_xac_nhan.js`
**Ngôn ngữ:** JavaScript thuần (Vanilla JS - tương ứng nhóm quy tắc JS trong rule_checker.md)

Tệp này đóng vai trò là UI Layer điều khiển toàn bộ logic giao diện của trang Phân Quyền Xác Nhận Khối Lượng Giảng Dạy, được khởi tạo qua sự kiện `DOMContentLoaded`. Tệp không xuất (export) bất kỳ module nào ra ngoài.

## 1. [Inputs]

Hàm `init()` đóng vai trò entry point và không nhận tham số.
Tuy nhiên, các hàm xử lý nội bộ (event handlers và callbacks) nhận các tham số đầu vào sau:

- **Hàm `selectSystem(btn)`**:
  - `btn` (`Element`): Nút tab hệ đào tạo được click.
- **Hàm `syncRightCard(checkbox)`**:
  - `checkbox` (`HTMLInputElement`): Checkbox quyền tương ứng với thẻ card.
- **Hàm `renderCustomCell(row, colId, value)`** (Callback cho DataTable):
  - `row` (`Object`): Bản ghi phân quyền hiện tại.
  - `colId` (`String`): Định danh cột (ví dụ: `trang_thai`, `quyen_cap_nhat`, `__actions`).
  - `value` (`Any`): Giá trị của ô.
- **Hàm `onThuHoiPhanQuyen(id)`**:
  - `id` (`String` | `Number`): ID của bản ghi phân quyền cần thu hồi.

## 2. [Exports & Dependencies]

- **[Exports/Visibility]**: Tệp này không có khai báo `export` hay public function toàn cục. Mọi logic được gói gọn bên trong file và gắn trực tiếp vào các phần tử DOM trên giao diện.
- **[Dependencies]**: Tệp phụ thuộc vào các module tiện ích (script) đã được tải ngầm (thông qua `base.html` hoặc tag script phía trên):
  - `phanQuyenXacNhanApi`: Xử lý giao tiếp mạng (từ `api/admin/phanQuyenXacNhanApi.js`).
  - `ComboBox`: Khởi tạo custom dropdown (từ `components/combo_box.js`).
  - `DataTable`: Quản lý danh sách, phân trang (từ `components/datatable.js`).
  - `showToast`: Hiển thị thông báo (từ `components/toast.js`).
  - `confirmModal`: Hộp thoại xác nhận (từ `components/confirm_modal.js`).

## 3. [State & Side-effects]

Tệp thực hiện các side-effect sau:

- **State ngầm (`state` object toàn cục trong file):**
  - `selectedHeId`: Lưu ID hệ đào tạo đang chọn.
  - `danhSachNguoiCapNhat`: Lưu danh sách người cập nhật lớp (cache từ bộ nhớ API).
  - `pickedNguoiCapNhat`: Biến `Set` chứa ID các người cập nhật lớp đang được tick chọn.
  - `scopeSearch`: Lưu từ khoá tìm kiếm đang nhập vào ô tìm kiếm bảng phạm vi.
- **Side-effects (DOM & Network):**
  - Gắn (bind) event listeners lên tài liệu (document/window thông qua delegation) và các phần tử DOM cố định.
  - Mutate DOM: Thay đổi thuộc tính lớp CSS (`.active`, `.checked`), thay đổi thuộc tính `hidden`, thay đổi chuỗi phần tử thông qua thuộc tính `innerHTML` (chẳng hạn của bảng `#pq-scope-tbody`).
  - Network calls: Thực hiện Side-effect API qua các hàm (`getDanhSachDonVi`, `getDanhSachNguoiCapNhat`, `getColumnsConfig`, `getDanhSachPhanQuyen`, `luuPhanQuyen`, `thuHoiPhanQuyen`).
  - Mutate state nội bộ: Lưu giữ và thay đổi liên tục state của các component UI (`comboDonVi`, `comboCanBo`, `comboTrangThai`, `pqDataTable`).

## 4. [Outputs]

- **Main Output**: Script không có lệnh `return` giá trị (Output) trực tiếp nào để module khác gọi ra (vì script đóng vai trò chỉ huy DOM khi trang load). Mọi xử lý đều đẩy thành trạng thái lên giao diện.
- **Output của các hàm xử lý dữ liệu nội bộ**:
  - `getCheckedRights()`: Trả về `Array<String>` danh sách ID quyền thao tác đang tick chọn.
  - `buildPayload()`: Trả về `Object` dữ liệu định dạng sẵn để chuẩn bị gửi lên server lưu phân quyền.
  - `renderCustomCell()`: Trả về chuỗi `String` HTML để vẽ ô bảng, hoặc trả về `null` nhường cho DataTable tự render mặc định.

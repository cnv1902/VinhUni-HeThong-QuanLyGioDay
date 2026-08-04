---
applyTo: "**/*.html,**/*.css,**/*.js,**/*.jsx,**/*.tsx,**/*.vue,**/*.svelte"
---

# Bộ quy tắc thiết kế & xây dựng giao diện — Hệ thống nội bộ Đại học Vinh

Tài liệu này là nguồn quy tắc DUY NHẤT cho mọi giao diện quản trị/nội bộ được tạo ra
(dashboard, form quản lý, bảng dữ liệu, trang cấu hình...). Khi tạo hoặc chỉnh sửa bất kỳ
giao diện nào, luôn đọc và tuân theo file này trước khi viết code. Nếu một yêu cầu trong
hội thoại mâu thuẫn với quy tắc dưới đây, hãy hỏi lại thay vì tự ý phá vỡ quy tắc.

Gốc tham chiếu: giao diện `quan_ly_nhom_lop_hoc_phan.html` (Quản lý nhóm lớp học phần —
Đại học Vinh) đã được xây dựng và kiểm thử theo đúng bộ quy tắc này — dùng làm ví dụ mẫu
khi cần đối chiếu hành vi cụ thể.

## 1. Cấm tuyệt đối — không có ngoại lệ

- **Không dùng gradient** (linear-gradient, radial-gradient...) ở bất kỳ đâu: nền, nút, badge, thanh trạng thái, icon.
- **Không dùng `box-shadow` trang trí.** Ngoại lệ DUY NHẤT: halo mảnh 3px khi input được focus
  (`box-shadow: 0 0 0 3px <màu nhạt>`) — đây là chỉ báo trạng thái, không phải hiệu ứng đổ bóng/nổi khối.
- **Không bo góc quá 8px** cho khối lớn (card, panel, input, button, bảng). Ngoại lệ: badge trạng thái
  dạng pill nhỏ (được phép bo tròn hoàn toàn vì là ký hiệu nhỏ, không phải khối bố cục).
- **Không tạo cảm giác "giao diện AI mặc định":** không phối màu tím-hồng-neon sáo rỗng, không dùng
  font mặc định (Inter/Roboto...) nếu không có lý do, không thêm icon/emoji/hiệu ứng trang trí không
  phục vụ chức năng, không thêm animation/parallax không cần thiết.
- **Không dùng `alert()` / `confirm()` / `prompt()`** mặc định của trình duyệt — luôn dùng toast hoặc
  thành phần UI riêng của hệ thống.
- **Không dùng dữ liệu mẫu vô nghĩa** ("Lorem ipsum", "Item 1", "John Doe", "test test") — luôn sinh dữ
  liệu tiếng Việt thực tế, đúng ngữ cảnh nghiệp vụ của Đại học Vinh (xem mục 8).

## 2. Bảng màu chuẩn — copy nguyên văn, không tự chế hex mới

```css
:root{
  /* Thương hiệu — lấy trực tiếp từ logo Đại học Vinh (#0055AF), KHÔNG đoán hex */
  --brand-800:#0055AF;   /* topbar, nút primary, toast, nút "Áp dụng" trong dropdown lọc */
  --brand-700:#1568C4;   /* hover của brand-800 */
  --brand-900:#003D82;   /* active/pressed của brand-800 */

  /* Màu nhấn phụ — dùng cho tương tác thứ cấp, KHÔNG thay thế brand-800 */
  --teal-600:#0E7C7B;    /* focus ring, icon sắp xếp/lọc đang active, avatar, viền nút outline phụ */
  --teal-700:#0A5F5E;
  --teal-50:#E6F4F3;

  /* Nền & viền trung tính */
  --bg-page:#EEF1F4;
  --bg-panel:#FFFFFF;
  --bg-subtle:#F4F6F8;
  --bg-subtle-2:#EAEDF0;
  --border:#DCE3E9;
  --border-strong:#C3CDD5;

  /* Chữ */
  --text-primary:#182430;
  --text-secondary:#5B6B78;
  --text-muted:#96A3AD;

  /* Màu ngữ nghĩa trạng thái — không dùng brand-800 cho các ý nghĩa này */
  --green-600:#1E7A4C; --green-50:#E5F3EA;  /* thành công / đã xác nhận */
  --amber-600:#A8710D; --amber-50:#FBF0DA;  /* cảnh báo / gần giới hạn / dòng chưa lưu (dirty) */
  --red-600:#B23A2E;  --red-50:#FBE8E5;     /* lỗi / vượt giới hạn */
  --blue-600:#2560A6; --blue-50:#E6F0FA;    /* đã khoá / đã xử lý xong — khác brand-800 */
}
```

Nếu dự án dùng cho đơn vị khác có logo/màu thương hiệu riêng: lấy màu chủ đạo thật bằng cách
lấy mẫu pixel từ file logo được cung cấp (không đoán hex bằng mắt), chỉ thay nhóm `--brand-*`,
giữ nguyên toàn bộ cấu trúc và vai trò của các token còn lại.

## 3. Typography

- Font chữ chính toàn giao diện: **IBM Plex Sans** (400/500/600), tải qua Google Fonts.
- Font số liệu: **IBM Plex Mono** — dùng cho MỌI cột số, mã (ID/code), giá trị đếm được, kèm
  `font-variant-numeric: tabular-nums` để căn số đẹp như bảng tính.
- Cỡ chữ: 14px nội dung mặc định · 13px trong bảng dữ liệu · 11.5–12px cho label/metadata/badge ·
  15px cho tiêu đề khối. Không dùng cỡ chữ lớn hơn 16px trừ tiêu đề trang.

## 4. Cấu trúc trang chuẩn (thứ tự từ trên xuống)

1. **Topbar** — nền `--brand-800`, chữ trắng. Trái: icon/logo hệ thống + tên module. Phải: ngữ cảnh
   hiện tại (kỳ học/phòng ban/vai trò đang thao tác) + avatar.
2. **Toolbar hành động** — nền trắng, viền dưới `--border`. Đúng **1 nút `primary`** cho hành động
   quan trọng nhất của màn hình, các nút còn lại dùng kiểu `ghost` (viền xám, nền trắng).
3. **Panel bộ lọc** (đóng/mở được) — chia theo **nhóm ý nghĩa** (ví dụ "Phân loại" / "Khoảng giá trị"),
   mỗi nhóm có tiêu đề nhỏ viết hoa. Mỗi nhóm dùng CSS grid với **số cột cố định**, không dùng
   `auto-fit` cho cả panel vì gây lệch hàng khi số trường thay đổi. Trường khoảng số (từ–đến) để độ
   rộng cố định gọn (~220px), không kéo giãn ngang bằng cột select bên cạnh.
4. **Thanh tìm kiếm nhanh** — luôn hiển thị phía trên bảng dữ liệu dù panel lọc đang đóng hay mở.
   Không lặp lại trường đã có sẵn trong panel lọc (một chức năng chỉ nên xuất hiện ở một nơi).
5. **Bảng dữ liệu** — xem mục 6.
6. **Thanh trạng thái footer** — tổng số dòng / đang hiển thị sau lọc / số dòng đã chọn / các số
   tổng hợp liên quan (SUM các cột số quan trọng nhất).

## 5. Thành phần dùng lại

**Nút**
- `primary`: nền `--brand-800`, chữ trắng · hover `--brand-700` · active `--brand-900`.
- `ghost` (mặc định): nền trắng, viền `--border-strong` · hover nền `--bg-subtle`.
- `outline nhấn phụ`: viền `--teal-600`, chữ `--teal-700` — dùng cho hành động dạng "xuất/tải xuống".
- Cao 32px, bo góc 6px, icon svg 14×14 bên trái chữ nếu phù hợp.

**Input / Select**
- Cao 32px, viền 1px `--border-strong`, bo góc 6px.
- Focus: viền `--teal-600` + `box-shadow: 0 0 0 3px var(--teal-50)`.

**Badge trạng thái**
- Dạng pill nhỏ, màu theo mục 2 (xanh lá = tích cực, cam = cảnh báo/tạm, xám = trung tính, xanh
  dương phụ `--blue-*` = đã khoá/hoàn tất). Không dùng `--brand-800` cho badge.

**Toast thông báo**
- Góc dưới-phải màn hình, nền `--brand-800`, chữ trắng, tự ẩn sau ~2.5s. Dùng cho MỌI phản hồi thao
  tác (lưu, xuất, lỗi, cảnh báo) thay cho `alert()`.

**Dropdown lọc kiểu Excel** (bắt buộc cho mọi cột có thể lọc)
- Mở khi bấm icon phễu ở header cột. Có: ô tìm nhanh, checkbox "Chọn tất cả", danh sách checkbox
  từng giá trị duy nhất của cột, nút "Xoá lọc" và "Áp dụng".

## 6. Quy tắc riêng cho bảng dữ liệu (áp dụng khi bảng > 5 cột hoặc cần sửa trực tiếp)

1. Mỗi cột header có **2 icon riêng biệt**: **sắp xếp** (▲▼, bấm đổi vòng tăng → giảm → bỏ sắp xếp,
   chỉ một cột được sắp xếp tại một thời điểm) và **lọc** (icon phễu, mở dropdown như mục 5).
2. Cột chọn dòng (checkbox) + tối đa 2 cột định danh quan trọng nhất phải `position: sticky` khi
   cuộn ngang. Thứ tự z-index bắt buộc: cột ghim ở header > header thường > cột ghim ở thân bảng >
   ô thường — để không bị nội dung khác đè lên khi cuộn cả hai chiều.
3. **Sửa dữ liệu bằng cách nháy đúp vào ô.** Với MỌI ô có thể sửa — kể cả ô có danh sách giá trị gợi
   ý cố định (khoa, trạng thái, hình thức học...) — PHẢI dùng
   `<input type="text" list="...">` kết hợp `<datalist>` (combobox), **tuyệt đối không dùng `<select>`
   cứng để sửa ô**, vì sẽ chặn người dùng nhập giá trị mới ngoài danh sách có sẵn. Cột số dùng
   `<input type="number">`.
4. Dòng vừa sửa nhưng chưa lưu → tô nền `--amber-50` (trạng thái "dirty"). Dòng bị khoá sửa vì lý do
   nghiệp vụ → tô nền `--blue-50`, chặn thao tác nháy đúp và hiện toast giải thích rõ lý do cụ thể —
   không được im lặng bỏ qua thao tác của người dùng.
5. Cột số và mã dùng font mono với `tabular-nums`.
6. Nếu có cột thể hiện tỉ lệ/sức chứa (đăng ký/giới hạn, tồn kho/định mức...) → trực quan hoá bằng
   thanh mini màu theo 3 ngưỡng (xanh = đủ chỗ, cam = gần giới hạn, đỏ = vượt giới hạn), không chỉ
   hiện con số suông.

## 7. Trạng thái tương tác cần xử lý đầy đủ

hover dòng/nút · focus bàn phím rõ ràng · dirty state · locked state · trạng thái rỗng (không có
dữ liệu sau khi lọc → hiện thông báo rõ ràng, không để bảng trắng trơn) · loading (khi có gọi API
thật).

## 8. Dữ liệu mẫu khi làm prototype (chưa nối API thật)

Luôn sinh dữ liệu tiếng Việt đúng ngữ cảnh nghiệp vụ thật của trường đại học (tên môn học, tên
khoa, mã lớp, học kỳ...), đủ số dòng để kiểm thử cuộn/lọc/sắp xếp (tối thiểu ~30 dòng). Không dùng
placeholder vô nghĩa.

## 9. Kỹ thuật & tự kiểm tra trước khi giao (bắt buộc)

- Nếu không được yêu cầu framework cụ thể: ưu tiên HTML/CSS/JS thuần, gọn nhẹ, không phụ thuộc
  ngoài ngoại trừ Google Fonts.
- Trước khi trả kết quả: tự kiểm tra code không lỗi cú pháp, và các thao tác chính (sắp xếp, lọc,
  sửa ô, lưu, xuất dữ liệu) chạy đúng. Nếu có thể, tự viết một đoạn kiểm thử mô phỏng thao tác để
  xác nhận trước khi báo hoàn thành.

## 10. Khi yêu cầu chưa rõ

Không tự đoán ý nghĩa nghiệp vụ của các trường lạ hoặc chưa rõ nguồn dữ liệu. Nêu rõ giả định đã
dùng, và hỏi lại nếu điều đó ảnh hưởng đáng kể đến logic — thay vì âm thầm bịa ra cho đủ.

## 11. Checklist nhanh trước khi trả kết quả

- [ ] Không gradient / không box-shadow trang trí / không bo góc quá 8px ở khối lớn?
- [ ] Màu dùng đúng token ở mục 2, không tự chế hex mới?
- [ ] Ô sửa dữ liệu có danh sách gợi ý dùng `input + datalist`, không dùng `select` cứng?
- [ ] Panel lọc chia nhóm rõ ràng, không trường nào bị lặp lại ở hai nơi?
- [ ] Cột số/mã dùng font mono?
- [ ] Dữ liệu mẫu là tiếng Việt, thực tế, đủ dòng để kiểm thử?
- [ ] Đã tự kiểm thử các thao tác chính, không lỗi, trước khi báo hoàn thành?

## 12. Kiến trúc thư mục và Mô-đun hóa (Bắt buộc)

Tuyệt đối KHÔNG viết toàn bộ HTML/CSS/JS của một trang vào chung một file duy nhất. Khi tạo mới hoặc tái cấu trúc một trang giao diện, bắt buộc phải tuân thủ kiến trúc phân tách sau:

**1. Cấu trúc Jinja2 Templates (Render phía Server):**
- **Layout chung (`app/templates/base.html`):** Chứa khung HTML tổng thể, nhúng CSS/JS dùng chung.
- **Thành phần dùng chung (`app/templates/layouts/`):** Chứa các file chia nhỏ như `navbar.html`, `sidebar.html`, `footer.html`.
- **Trang nội dung (`app/templates/pages/`):** Chứa file nội dung (content) cụ thể của từng trang (kế thừa `base.html`).

**2. Phân tách CSS (`static/css/`):**
- Chia nhỏ CSS theo vai trò thay vì viết dồn vào một file:
  - `layout.css`: Định dạng khung sườn trang (`.app`, `.app-body`, lưới...).
  - `components.css`: CSS cho các thành phần dùng chung (nút, input, checkbox, bảng...).
  - `sidebar.css`, `navbar.css`, `footer.css`: CSS cho các vùng tương ứng.
  - `content.css`: CSS cho vùng nội dung đặc thù (toolbar, filter...).

**3. Phân tách JavaScript (`static/js/`):**
- **`core/`**: Chứa logic hệ thống dùng chung ở mọi nơi.
  - `constants.js`: Định nghĩa hằng số, cấu hình, URL.
  - `utils.js`: Các hàm công cụ (format số, ngày, tạo chuỗi ngẫu nhiên...).
- **`components/`**: Chứa các khối chức năng UI độc lập.
  - Ví dụ: `toast.js` (hiển thị thông báo), `modal.js`.
- **`pages/`**: Chứa file JS chỉ huy riêng cho duy nhất một trang.
  - Mỗi trang một file (ví dụ: `quan_ly_nhom_lop_hoc_phan.js`). File này sẽ gọi các hàm từ `core` và `components` để xử lý sự kiện DOM cho trang đó.

*Mục đích: Đảm bảo khả năng bảo trì, dễ đọc, và nguyên tắc DRY (Don't Repeat Yourself).*


## 13. Quy tắc viết Javascript cho Trang (Page-level JS)

Để đảm bảo mã nguồn Javascript của từng trang dễ đọc và dễ bảo trì, tuyệt đối tuân thủ các quy tắc tổ chức sau:

1. **Gom nhóm mã nguồn (Grouping):** Chia file JS thành các phân khu rõ ràng bằng các dòng comment phân cách (ví dụ: // === 1. STATE ===). Các nhóm cơ bản thường bao gồm:
   - **State & DOM Elements:** Khai báo biến trạng thái toàn cục và các DOM Node cố định.
   - **Data Processing & Filtering:** Các hàm xử lý mảng dữ liệu, sắp xếp, lọc.
   - **Table/HTML Rendering:** Các hàm chuyên biệt tạo chuỗi HTML, vẽ bảng, vẽ phân trang.
   - **UI State Updaters:** Các hàm nhỏ cập nhật huy hiệu (badge), thống kê footer.
   - **Specific Features:** Các khối logic phức tạp lẻ (như Inline Editing, Excel-like Filter).
   - **Event Listeners Binding:** Gom tất cả quá trình gắn sự kiện (addEventListener) vào 1-2 hàm (như indTableEvents, indStaticEvents). Tránh rải rác gắn sự kiện ở mọi nơi.
   - **Initialization:** Hàm init() duy nhất để gọi API và khởi chạy trang.

2. **Bắt buộc chú thích (JSDoc):** Mọi hàm phải có bình luận /** ... */ phía trên, giải thích bằng tiếng Việt: Mục đích của hàm, giải thích các tham số (nếu có), và kết quả trả về.

3. **Event Delegation:** Tối đa hóa việc dùng kỹ thuật Event Delegation (gắn sự kiện click/change vào phần tử cha lớn như 	body, 	head và dùng e.target.closest()) thay vì dùng vòng lặp gắn cả ngàn sự kiện cho từng thẻ con bên trong bảng.

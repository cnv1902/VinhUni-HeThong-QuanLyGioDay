# Bản đã sửa — ứng dụng thử ký số (quản lý giờ dạy)

Chép đè cả thư mục `app/` là chạy được. Dưới đây là những gì đã đổi và vì sao.

## Chạy thế nào

```
pip install -r app/requirements.txt
uvicorn app.main:app --reload --port 4000
```

Mở `http://localhost:4000` — **gõ đúng `localhost`, không phải `127.0.0.1`**: với Microsoft và với
cổng ký thì đó là hai địa chỉ khác nhau, chỉ `localhost` được khai. **Phải đúng cổng 4000** — cổng chính là một phần của địa chỉ đã đăng
ký với Microsoft và với cổng ký; chạy cổng khác là hai bên từ chối.

Trước lần chạy đầu, kiểm tra trên Entra ID — App Registration `4cecf646-a561-49c3-b1aa-1f5a0b251b4f`
→ **Authentication**:

- Có nền tảng **Single-page application** với **HAI** Redirect URI:
  - `http://localhost:4000`
  - `http://localhost:4000/static/dang-nhap-xong.html` ← trang trắng cho cửa sổ đăng nhập
- **Không** còn nền tảng *Mobile and desktop applications*
- Mục *Implicit grant*: **không** tích *Access tokens*, **không** tích *ID tokens*

## Ba lỗi đã sửa

### 1. Lấy vé đăng nhập ở phía máy chủ bằng MSAL Python

`main.py` cũ dùng `msal.PublicClientApplication` + `acquire_token_interactive()`. Đó là luồng dành
cho **ứng dụng desktop**. Trong mã nguồn MSAL Python nó dựng địa chỉ nhận mã như sau:

```python
redirect_uri = "http://localhost:{port}".format(port=port or 0)   # 0 = hệ điều hành tự chọn cổng
```

Nên mỗi lần chạy lại ra một cổng khác — đúng hiện tượng "localhost cổng lạ, không phải 4000", kèm
trang *"Authentication complete. You can return to the application."*

Trên máy lập trình thì máy chủ và trình duyệt là cùng một máy nên nó gần như chạy được. **Đưa lên
máy chủ thật thì hỏng hẳn**: trình duyệt sẽ bật lên trên máy chủ, không có ai ngồi đó để bấm.

→ Đã bỏ toàn bộ MSAL khỏi `main.py`. Vé nay lấy **ngay tại trình duyệt** bằng `msal-browser`.

### 2. Vé bị dùng chung cho mọi người — lỗi nặng nhất

`msal_app` là biến toàn cục, bộ nhớ đệm vé nằm trong tiến trình và dùng chung cho mọi lời gọi.
`get_accounts()` không lọc trả về **người đăng nhập gần nhất trên máy chủ**. Cộng với dòng gán cứng
trong `index.html`:

```js
userEmail = "lvduong@vinhuni.edu.vn";
```

thì **mọi văn bản đều ký dưới tên một người**, bất kể ai đang ngồi trước máy. Chữ ký số quy về sai
người thì không còn giá trị gì — đây là điều hệ thống phải chặn tuyệt đối.

Endpoint `/api/lay-token-ky` cũng **không xác thực người gọi**: ai vào được máy chủ là xin được vé.

→ Đã xoá hẳn endpoint đó và dòng gán cứng email. Vé lấy ở trình duyệt thì tự nó thuộc về đúng người
đang đăng nhập, không có cách nào lẫn.

### 3. `AADSTS90013: Invalid input received from the user`

```python
interactive_params = {
    "scopes": yeu_cau,
    "client_id": CLIENT_ID,   # <- dòng này gây lỗi
}
```

`client_id` **không phải tham số** của `acquire_token_interactive`. Chữ ký thật của hàm đó:

```
scopes, prompt, login_hint, domain_hint, claims_challenge, timeout, port,
extra_scopes_to_consent, max_age, parent_window_handle, on_before_launching_ui,
auth_scheme, **kwargs
```

Nó rơi vào `**kwargs` rồi bị đẩy thẳng xuống lời gọi HTTP tới Microsoft thành tham số thừa, và
Microsoft trả về đúng thông báo trên.

→ Không còn nữa, vì cả khối MSAL Python đã bỏ.

## Kiến trúc sau khi sửa

```
Trình duyệt (localhost:4000)
  ├─ msal-browser  ──────────────►  Microsoft 365      lấy vé của CHÍNH người đang ngồi ký
  ├─ VgcaSigning.openSignFlow ───►  ky.vinhuni.edu.vn  widget lo xem PDF, chọn vị trí, PIN
  └─ fetch(...document, Bearer) ─►  ky.vinhuni.edu.vn  lấy văn bản đã ký về

FastAPI (main.py)   chỉ còn: sinh PDF, trả PDF. Không đụng gì tới đăng nhập.
```

## Thư viện đăng nhập nằm ngay trong ứng dụng

`app/static/msal-browser.min.js` (bản 5.18.0, lấy từ npm) đi kèm sẵn trong gói này.

**Không nạp từ `alcdn.msauth.net`.** CDN đó đã bị Microsoft gỡ nội dung — mọi phiên bản đều trả
404, đã kiểm chứng bằng `curl`. Bản sửa đầu tiên còn trỏ vào đó và các anh gặp đúng lỗi
"không tải được thư viện"; nay tệp nằm trong `app/static/` nên không phụ thuộc mạng ngoài nữa.

Muốn cập nhật thư viện về sau:

```
npm pack @azure/msal-browser
tar xzf azure-msal-browser-*.tgz
copy package\lib\msal-browser.min.js app\static\msal-browser.min.js
```

Cổng ký cũng phục vụ sẵn tệp này ở `https://ky.vinhuni.edu.vn/widget/vendor/msal/msal-browser.min.js`
— dùng địa chỉ đó thay cho bản trong `static/` cũng được.

## Lưu ý khi đọc mã

- Biến MSAL trong `index.html` đặt tên là `ungDungMsal`, **không** đặt là `msal` — tên đó đã bị
  thư viện của Microsoft chiếm ở phạm vi toàn cục, khai trùng thì trang chết ngay lúc nạp với
  *"Cannot access 'msal' before initialization"*.
- Thư viện là MSAL **5.x**, nên **bắt buộc** gọi `await app.initialize()` trước mọi lời gọi khác —
  nếu không sẽ báo `uninitialized_public_client_application`. Mã đã giữ sẵn *promise* của bước khởi
  tạo, nên bấm hai lần liên tiếp vẫn chỉ khởi tạo một lần.
- Lấy văn bản đã ký phải dùng `fetch()` kèm header `Authorization`. **Không** đặt đường dẫn đó vào
  `<a href>` hay `<iframe src>` — thẻ HTML không mang được header, sẽ nhận 401.

## Chưa kiểm chứng được ở đây

Mã đã kiểm cú pháp cả Python lẫn JavaScript, nhưng **chưa chạy thật** vì bên sửa không có tài khoản
Microsoft 365 của trường. Các anh chạy rồi báo lại kết quả theo 6 mục nghiệm thu trong tài liệu
*Quy trình tiếp nhận ứng dụng tích hợp ký số*.

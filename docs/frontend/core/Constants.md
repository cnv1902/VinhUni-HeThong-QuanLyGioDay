# Tài liệu Core: Constants

**Đường dẫn:** `static/js/core/constants.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

---

## Trạng thái hiện tại

> ⚠️ File hiện tại **rỗng hoàn toàn** (0 bytes, không có nội dung).

File được tạo sẵn như một placeholder để định nghĩa các hằng số dùng chung toàn hệ thống trong tương lai.

---

## Ghi chú kiến trúc

Các hằng số toàn cục hiện tại được inject trực tiếp từ Jinja2 trong `base.html`:

```html
<!-- Inject từ server vào window object -->
<script>window.API_PREFIX = "{{ API_PREFIX }}";</script>
<script>window.APP_VERSION = "{{ CACHE_BUSTER() }}";</script>
```

Khi có nhu cầu thêm hằng số phía client (VD: số dòng mặc định mỗi trang, timeout, trạng thái mã hóa...), hãy định nghĩa trong file này thay vì hardcode rải rác trong các page JS.

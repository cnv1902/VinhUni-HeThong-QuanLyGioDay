// static/js/pages/login.js

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const btnTogglePassword = document.getElementById("btnTogglePassword");
  const passwordInput = document.getElementById("password");
  const btnWorkMail = document.getElementById("btnWorkMail");

  // Xử lý ẩn/hiện mật khẩu
  if (btnTogglePassword && passwordInput) {
    btnTogglePassword.addEventListener("click", () => {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Đổi icon tương ứng
      if (type === "text") {
        btnTogglePassword.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        btnTogglePassword.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    });
  }

  // Xử lý Đăng nhập thông thường
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = passwordInput.value;
      const remember = document.getElementById("rememberMe").checked;

      if (!username || !password) {
        if (typeof showToast === "function") {
          showToast("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
        } else {
          alert("Vui lòng nhập đầy đủ thông tin.");
        }
        return;
      }

      // Giả lập Đăng nhập thành công và chuyển hướng
      if (typeof showToast === "function") {
        showToast("Đăng nhập thành công! Đang chuyển hướng...");
      }

      setTimeout(() => {
        window.location.href = "/quan_ly_nhom_lop_hoc_phan.html";
      }, 1000);
    });
  }

  // Xử lý Quên mật khẩu
  const forgotLink = document.querySelector(".forgot-link");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof showToast === "function") {
        showToast("Chức năng Khôi phục mật khẩu đang được xây dựng.");
      }
    });
  }

  // Xử lý Đăng nhập bằng Mail Công Việc
  if (btnWorkMail) {
    btnWorkMail.addEventListener("click", () => {
      if (typeof showToast === "function") {
        showToast("Đang chuyển hướng sang cổng xác thực Microsoft/Google...");
      }
    });
  }
});

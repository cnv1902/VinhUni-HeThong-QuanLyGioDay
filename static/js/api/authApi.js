/**
 * Giao tiếp với Backend API xác thực.
 * Lưu ý: SSO callback được xử lý hoàn toàn ở Backend (/api/v1/auth/sso-callback).
 * Token được lưu trong HttpOnly Cookie - Frontend không cần tự xử lý.
 */
const apiAuth = {
  /**
   * Đăng xuất khỏi hệ thống.
   * Backend sẽ xóa Cookie access_token.
   * @returns {Promise<Object>} Phản hồi từ server
   */
  async logout() {
    const response = await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || "Lỗi đăng xuất");
    }

    return await response.json();
  },
};

/**
 * Quản lý dọn dẹp LocalStorage khi hệ thống cập nhật phiên bản mới.
 * Dựa trên biến window.APP_VERSION được inject từ Server-side (Jinja).
 */
(function () {
  if (typeof window.APP_VERSION === "undefined") return;

  const currentVersion = window.APP_VERSION;
  const savedVersion = localStorage.getItem("APP_VERSION");

  if (savedVersion !== currentVersion) {
    // Dọn sạch toàn bộ cấu hình, bộ lọc cũ
    localStorage.clear();
    // Lưu lại phiên bản mới để lần sau không xóa nữa
    localStorage.setItem("APP_VERSION", currentVersion);
    console.log(
      `[CacheManager] System updated to version: ${currentVersion}. LocalStorage has been wiped to ensure data integrity.`,
    );
  }
})();

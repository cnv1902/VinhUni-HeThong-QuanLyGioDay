/**
 * BaseModal - Quản lý trạng thái và sự kiện của Modal chung
 * Tuân thủ UI Rules Đại học Vinh
 */
class BaseModal {
  /**
   * @param {string} modalId - ID của thẻ modal-overlay
   */
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    if (!this.modal) {
      console.error(`BaseModal: Không tìm thấy modal có ID '${modalId}'`);
      return;
    }

    // Tự động tìm các nút đóng để gắn sự kiện
    this.closeBtns = this.modal.querySelectorAll("[data-close-modal]");

    // Sự kiện hooks cho component con
    this.onOpen = null;
    this.onClose = null;

    this.bindEvents();
  }

  /**
   * Gắn sự kiện đóng modal
   */
  bindEvents() {
    // Đóng khi click nút Hủy bỏ / X
    this.closeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.close();
      });
    });

    // Đóng khi click ra ngoài vùng xám (overlay)
    this.modal.addEventListener("mousedown", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Hỗ trợ đóng bằng phím ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.style.display === "flex") {
        this.close();
      }
    });
  }

  /**
   * Mở modal
   */
  open() {
    this.modal.style.display = "flex";
    // Đã bỏ form.reset() ở đây để tránh đè dữ liệu khi Edit (các form nên tự reset trước khi open)

    if (typeof this.onOpen === "function") {
      this.onOpen();
    }
  }

  /**
   * Đóng modal
   */
  close() {
    this.modal.style.display = "none";
    if (typeof this.onClose === "function") {
      this.onClose();
    }
  }
}

window.BaseModal = BaseModal;

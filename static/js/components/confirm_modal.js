/**
 * UI Component: Confirm Modal
 * Thay thế cho window.confirm() mặc định.
 */
class ConfirmModal {
  constructor() {
    this.modalEl = document.getElementById('globalConfirmModal');
    if (!this.modalEl) return;
    
    this.titleEl = document.getElementById('confirmModalTitle');
    this.messageEl = document.getElementById('confirmModalMessage');
    this.btnOk = document.getElementById('btnConfirmOk');
    this.btnCancel = document.getElementById('btnConfirmCancel');
    
    // Khởi tạo BaseModal cho nó để hỗ trợ đóng mở, click ra ngoài
    this.baseModal = new BaseModal('globalConfirmModal');
    
    this.resolvePromise = null;
    
    // Gỡ bỏ sự kiện click mặc định để tránh duplicate listener
    const newBtnOk = this.btnOk.cloneNode(true);
    this.btnOk.parentNode.replaceChild(newBtnOk, this.btnOk);
    this.btnOk = newBtnOk;
    
    const newBtnCancel = this.btnCancel.cloneNode(true);
    this.btnCancel.parentNode.replaceChild(newBtnCancel, this.btnCancel);
    this.btnCancel = newBtnCancel;

    this.btnOk.addEventListener('click', () => {
      if (this.resolvePromise) this.resolvePromise(true);
      this.baseModal.close();
    });
    
    // Nếu huỷ bỏ, trả về false
    const handleCancel = () => {
      if (this.resolvePromise) this.resolvePromise(false);
      this.resolvePromise = null;
      this.baseModal.close();
    };
    
    this.btnCancel.addEventListener('click', handleCancel);
    
    // Lắng nghe sự kiện close từ BaseModal
    this.modalEl.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', handleCancel);
    });
  }
  
  /**
   * Mở modal xác nhận
   * @param {string} message 
   * @param {string} title 
   * @param {string} confirmText 
   * @param {string} confirmColor 
   * @returns {Promise<boolean>}
   */
  show(message, title = 'Xác nhận', confirmText = 'Xác nhận', confirmColor = 'var(--red-600)') {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      
      this.titleEl.textContent = title;
      this.messageEl.innerHTML = message;
      this.btnOk.textContent = confirmText;
      this.btnOk.style.backgroundColor = confirmColor;
      this.btnOk.style.borderColor = confirmColor;
      
      this.baseModal.open();
    });
  }
}

// Khởi tạo instance toàn cục
let confirmModal;
document.addEventListener('DOMContentLoaded', () => {
  if (typeof BaseModal !== 'undefined') {
    confirmModal = new ConfirmModal();
  }
});

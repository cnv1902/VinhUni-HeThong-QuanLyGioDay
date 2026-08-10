/**
 * UI Component: ComboBox (Single-select Autocomplete)
 * Thay thế cho thẻ <datalist> mặc định xấu xí của trình duyệt.
 */
class ComboBox {
  constructor(containerSelector, options) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    // options: { data: [{id: 1, text: "Kỳ 1"}], fieldName: "TuMaHocKy", placeholder: "Chọn...", defaultValue: 1 }
    this.options = options || {};
    this.data = this.options.data || [];
    this.fieldName = this.options.fieldName || 'ComboBoxHidden';
    
    this.selectedId = this.options.defaultValue || null;

    this.renderInitialUI();
    this.bindEvents();
    
    if (this.selectedId) {
      this.setValue(this.selectedId);
    }
  }

  renderInitialUI() {
    this.container.innerHTML = `
      <div style="position: relative; width: 100%;">
        <input type="text" class="form-input combobox-input" placeholder="${this.options.placeholder || 'Chọn...'}" autocomplete="off">
        <input type="hidden" name="${this.fieldName}" class="combobox-hidden">
      </div>
    `;
    this.inputField = this.container.querySelector('.combobox-input');
    this.hiddenInput = this.container.querySelector('.combobox-hidden');
    
    // Tạo dropdown rời (chưa append)
    if (!this.dropdownMenu) {
      this.dropdownMenu = document.createElement('div');
      this.dropdownMenu.className = 'tag-dropdown-menu combobox-dropdown';
      this.dropdownMenu.style.display = 'none';
      // Tránh việc nhấp vào menu làm đóng modal
      this.dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  bindEvents() {
    // Focus or click: hiển thị dropdown (lọc theo nội dung hiện tại hoặc hiện tất)
    this.inputField.addEventListener('focus', () => this.showDropdown());
    this.inputField.addEventListener('click', () => this.showDropdown());

    // Nhập liệu: hiển thị & lọc
    this.inputField.addEventListener('input', (e) => {
      this.showDropdown(e.target.value);
      // Nếu xóa trắng thì xóa selection
      if (e.target.value.trim() === '') {
        this.selectedId = null;
        this.hiddenInput.value = '';
      }
    });

    // Bắt phím Enter
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstItem = this.dropdownMenu.querySelector('.tag-dropdown-item');
        if (firstItem && this.dropdownMenu.style.display !== 'none') {
          firstItem.click();
        }
      }
    });

    // Click ngoài và cuộn chuột
    const handleOutsideClickOrScroll = (e) => {
      if (e.type === 'click') {
        if (!this.container.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
          this.hideDropdown();
          if (this.selectedId) {
            const matched = this.data.find(d => d.id == this.selectedId);
            if (matched && this.inputField.value !== matched.text) {
              this.inputField.value = matched.text;
            }
          }
        }
      } else if (e.type === 'scroll' && e.target.nodeType === 1 && !this.dropdownMenu.contains(e.target)) {
        this.hideDropdown();
      }
    };

    document.addEventListener('click', handleOutsideClickOrScroll);
    document.addEventListener('scroll', handleOutsideClickOrScroll, true);
  }

  showDropdown(query = '') {
    const q = query.toLowerCase().trim();
    let available = this.data;
    
    if (q) {
      available = this.data.filter(item => item.text.toLowerCase().includes(q));
    }

    if (available.length === 0) {
      this.dropdownMenu.innerHTML = `<div class="tag-dropdown-item" style="color: var(--text-muted); cursor: default;">Không tìm thấy kết quả</div>`;
    } else {
      this.dropdownMenu.innerHTML = available.map(item => `
        <div class="tag-dropdown-item ${item.id == this.selectedId ? 'selected' : ''}" data-id="${item.id}" data-text="${item.text}">
          ${item.text}
        </div>
      `).join('');

      const items = this.dropdownMenu.querySelectorAll('.tag-dropdown-item[data-id]');
      items.forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setValue(el.dataset.id);
          this.hideDropdown();
        });
      });
    }

    // Đưa ra ngoài overlay để tránh bị scroll và đè z-index
    const rect = this.inputField.getBoundingClientRect();
    const modalOverlay = this.container.closest('.modal-overlay');
    
    if (modalOverlay) {
      modalOverlay.appendChild(this.dropdownMenu);
      this.dropdownMenu.style.top = `${rect.bottom}px`;
      this.dropdownMenu.style.left = `${rect.left}px`;
    } else {
      // Fallback nếu không nằm trong modal
      document.body.appendChild(this.dropdownMenu);
      this.dropdownMenu.style.top = `${rect.bottom + window.scrollY}px`;
      this.dropdownMenu.style.left = `${rect.left + window.scrollX}px`;
    }
    this.dropdownMenu.style.width = `${rect.width}px`;
    this.dropdownMenu.style.display = 'block';
  }

  hideDropdown() {
    this.dropdownMenu.style.display = 'none';
  }

  setValue(id) {
    const item = this.data.find(d => d.id == id);
    if (item) {
      this.selectedId = item.id;
      this.inputField.value = item.text;
      this.hiddenInput.value = item.id;
    } else {
      this.selectedId = null;
      this.inputField.value = '';
      this.hiddenInput.value = '';
    }
  }

  getValue() {
    return this.selectedId;
  }

  clear() {
    this.selectedId = null;
    this.inputField.value = '';
    this.hiddenInput.value = '';
  }
}

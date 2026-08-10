/**
 * UI Component: Tag Input (Multi-select)
 * Quản lý thẻ nhập nhiều lựa chọn với tính năng dropdown tự động.
 */
class TagInput {
  constructor(containerSelector, options) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    // options: { data: [{id: 1, text: "Lý thuyết"}], fieldName: "DsMaHTHoc", placeholder: "Gõ để tìm kiếm..." }
    this.options = options || {};
    this.data = this.options.data || [];
    this.fieldName = this.options.fieldName || 'TagInputHidden';
    this.selectedItems = []; // Lưu các object {id, text} đã chọn

    this.renderInitialUI();
    this.bindEvents();
  }

  renderInitialUI() {
    this.container.innerHTML = `
      <div class="tag-input-wrapper form-input" tabindex="-1">
        <div class="tag-list" id="tagList_${this.fieldName}"></div>
        <input type="text" class="tag-input-field" placeholder="${this.options.placeholder || 'Thêm...'}" autocomplete="off">
      </div>
      <input type="hidden" name="${this.fieldName}" id="hidden_${this.fieldName}">
    `;
    this.container.style.position = 'relative';
    this.wrapper = this.container.querySelector('.tag-input-wrapper');
    this.inputField = this.container.querySelector('.tag-input-field');
    
    // Tạo dropdown rời (chưa append)
    if (!this.dropdownMenu) {
      this.dropdownMenu = document.createElement('div');
      this.dropdownMenu.className = 'tag-dropdown-menu';
      this.dropdownMenu.style.display = 'none';
      this.dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
    }
    
    this.tagList = this.container.querySelector('.tag-list');
    this.hiddenInput = this.container.querySelector(`#hidden_${this.fieldName}`);
  }

  bindEvents() {
    // Focus wrapper khi click
    this.wrapper.addEventListener('click', () => {
      this.inputField.focus();
    });

    // Bắt sự kiện gõ phím
    this.inputField.addEventListener('input', (e) => {
      this.showDropdown(e.target.value);
    });

    // Mở dropdown khi focus
    this.inputField.addEventListener('focus', () => {
      this.showDropdown(this.inputField.value);
    });

    // Xóa tag khi ấn Backspace lúc input rỗng
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && this.inputField.value === '') {
        this.removeLastTag();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Nếu có item đầu tiên trong dropdown đang hiển thị thì chọn nó
        const firstItem = this.dropdownMenu.querySelector('.tag-dropdown-item');
        if (firstItem && this.dropdownMenu.style.display !== 'none') {
          firstItem.click();
        }
      }
    });

    // Bắt sự kiện click ngoài dropdown để đóng
    const handleOutsideClickOrScroll = (e) => {
      if (e.type === 'click') {
        if (!this.container.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
          this.hideDropdown();
        }
      } else if (e.type === 'scroll' && e.target.nodeType === 1 && !this.dropdownMenu.contains(e.target)) {
        this.hideDropdown();
      }
    };
    
    document.addEventListener('click', handleOutsideClickOrScroll);
    document.addEventListener('scroll', handleOutsideClickOrScroll, true);

    // Delegate xóa tag
    this.tagList.addEventListener('click', (e) => {
      if (e.target.closest('.tag-remove-btn')) {
        const idToRemove = e.target.closest('.tag-item').dataset.id;
        this.removeTag(idToRemove);
      }
    });
  }

  showDropdown(query) {
    const q = query.toLowerCase().trim();
    // Lọc data chưa được chọn
    const available = this.data.filter(item => 
      !this.selectedItems.find(s => s.id == item.id) && 
      item.text.toLowerCase().includes(q)
    );

    if (available.length === 0) {
      this.hideDropdown();
      return;
    }

    this.dropdownMenu.innerHTML = available.map(item => `
      <div class="tag-dropdown-item" data-id="${item.id}" data-text="${item.text}">
        ${item.text}
      </div>
    `).join('');

    // Gắn sự kiện click chọn
    const items = this.dropdownMenu.querySelectorAll('.tag-dropdown-item');
    items.forEach(el => {
      el.addEventListener('click', () => {
        this.addTag(el.dataset.id, el.dataset.text);
      });
    });

    // Đưa ra ngoài overlay để tránh bị scroll và đè z-index
    const rect = this.wrapper.getBoundingClientRect();
    const modalOverlay = this.container.closest('.modal-overlay');
    
    if (modalOverlay) {
      modalOverlay.appendChild(this.dropdownMenu);
      this.dropdownMenu.style.top = `${rect.bottom}px`;
      this.dropdownMenu.style.left = `${rect.left}px`;
    } else {
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

  addTag(id, text) {
    // Không thêm trùng
    if (this.selectedItems.find(s => s.id == id)) return;
    
    this.selectedItems.push({ id, text });
    this.updateUI();
    this.inputField.value = '';
    this.inputField.focus();
    this.hideDropdown();
  }

  removeTag(id) {
    this.selectedItems = this.selectedItems.filter(s => s.id != id);
    this.updateUI();
  }

  removeLastTag() {
    if (this.selectedItems.length > 0) {
      this.selectedItems.pop();
      this.updateUI();
    }
  }

  updateUI() {
    // Vẽ lại danh sách thẻ
    this.tagList.innerHTML = this.selectedItems.map(item => `
      <div class="tag-item" data-id="${item.id}">
        <span class="tag-text">${item.text}</span>
        <button type="button" class="tag-remove-btn">&times;</button>
      </div>
    `).join('');
    
    // Cập nhật giá trị hidden (ví dụ: ,1,2,)
    if (this.selectedItems.length > 0) {
      const ids = this.selectedItems.map(i => i.id).join(',');
      this.hiddenInput.value = `,${ids},`;
    } else {
      this.hiddenInput.value = '';
    }
  }

  getValue() {
      return this.hiddenInput.value;
  }

  /** Xóa toàn bộ dữ liệu, làm mới (dùng khi mở Modal Thêm Mới) */
  clear() {
    this.selectedItems = [];
    this.inputField.value = '';
    this.updateUI();
  }

  getValues() {
    return this.selectedItems;
  }
}

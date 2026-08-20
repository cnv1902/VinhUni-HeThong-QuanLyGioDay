/**
 * Component FormulaBuilder
 * Tuân thủ chuẩn Vanilla JS và JSDoc theo UI Rules
 */

class FormulaBuilder {
  // === 1. STATE & KHỞI TẠO ===
  /**
   * Khởi tạo FormulaBuilder
   * @param {string|HTMLElement} container - Nơi render component
   * @param {Object} options - Các thuộc tính cấu hình
   * @param {Array<{key: string, label: string}>} options.dictionary - Từ điển biến số
   * @param {string} options.initialValue - Giá trị ban đầu (raw string)
   * @param {Function} options.onChange - Hàm callback (rawValue, semanticValue)
   */
  constructor(container, options = {}) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;
    if (!this.container)
      throw new Error(`Không tìm thấy phần tử container: ${container}`);

    this.dictionary = options.dictionary || [];
    this.rawValue = options.initialValue || "";
    this.onChangeCallback = options.onChange || function () {};

    this.initUI();
    this.bindEvents();
    this.triggerChange(); // Render semantic lần đầu
  }

  // === 2. UI RENDER ===
  /**
   * Dựng khung giao diện cho Component
   */
  initUI() {
    this.container.classList.add("formula-builder-wrapper");

    // 2.1 Toolbar Group
    const toolbarHTML = `
            <div class="fb-toolbar">
                <div class="fb-group fb-operators">
                    <span class="fb-group-label">Toán tử:</span>
                    <button type="button" class="fb-btn" data-insert=" + ">+</button>
                    <button type="button" class="fb-btn" data-insert=" - ">-</button>
                    <button type="button" class="fb-btn" data-insert=" * ">*</button>
                    <button type="button" class="fb-btn" data-insert=" / ">/</button>
                    <button type="button" class="fb-btn" data-insert="(">(</button>
                    <button type="button" class="fb-btn" data-insert=")">)</button>
                </div>
                
                <div class="fb-group fb-functions">
                    <span class="fb-group-label">Hàm số:</span>
                    <button type="button" class="fb-btn" data-insert="ROUND( , )" data-offset="-4">ROUND</button>
                    <button type="button" class="fb-btn" data-insert="IF( , , )" data-offset="-6">IF</button>
                    <button type="button" class="fb-btn" data-insert="MAX( , )" data-offset="-4">MAX</button>
                </div>
                
                <div class="fb-group fb-dictionary">
                    <span class="fb-group-label">Biến số:</span>
                    ${this.dictionary
                      .map(
                        (item) => `
                        <button type="button" class="fb-btn fb-btn-var" data-insert="${item.key}" title="${item.label}">
                            ${item.label}
                        </button>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;

    // 2.2 Editor & Preview Group
    const editorHTML = `
            <div class="fb-editor-container">
                <textarea class="fb-textarea" placeholder="Nhập công thức...">${this.rawValue}</textarea>
                <div class="fb-semantic-preview">
                    <span class="fb-preview-label">Diễn giải: </span>
                    <span class="fb-preview-content"></span>
                </div>
            </div>
        `;

    this.container.innerHTML = toolbarHTML + editorHTML;

    // Lưu trữ các DOM elements cần thiết
    this.textarea = this.container.querySelector(".fb-textarea");
    this.previewContent = this.container.querySelector(".fb-preview-content");
  }

  // === 3. LOGIC & XỬ LÝ CHUỖI ===
  /**
   * Dò tìm và thay thế key thành [label] bằng Regex word boundary
   * @param {string} raw - Chuỗi nguyên gốc
   * @returns {string} - Chuỗi ngữ nghĩa
   */
  buildSemanticValue(raw) {
    let semantic = raw;
    // Lặp qua từ điển để thay thế các từ khóa chính xác
    this.dictionary.forEach((item) => {
      // \\b đảm bảo chỉ thay thế cụm từ độc lập (word boundary)
      const regex = new RegExp(`\\b${item.key}\\b`, "g");
      semantic = semantic.replace(regex, `[${item.label}]`);
    });
    return semantic;
  }

  /**
   * Chèn text vào đúng vị trí con trỏ chuột
   * @param {string} text - Văn bản cần chèn
   * @param {number} offset - Độ lệch lùi con trỏ (dùng cho hàm, vd lùi vào trong ngoặc)
   */
  insertTextAtCursor(text, offset = 0) {
    this.textarea.focus();

    const startPos = this.textarea.selectionStart;
    const endPos = this.textarea.selectionEnd;
    const currentVal = this.textarea.value;

    // Chèn vào giữa
    const newVal =
      currentVal.substring(0, startPos) + text + currentVal.substring(endPos);
    this.textarea.value = newVal;

    // Dời con trỏ
    const newCursorPos = startPos + text.length + offset;
    this.textarea.setSelectionRange(newCursorPos, newCursorPos);

    // Cập nhật state
    this.rawValue = newVal;
    this.triggerChange();
  }

  /**
   * Làm sạch hoàn toàn nội dung editor
   */
  clear() {
    this.rawValue = "";
    this.textarea.value = "";
    this.triggerChange();
  }

  // === 4. EVENTS ===
  /**
   * Kích hoạt cập nhật UI và bắn callback ra ngoài
   */
  triggerChange() {
    const semanticValue = this.buildSemanticValue(this.rawValue);

    // Cập nhật Preview UI
    this.previewContent.textContent = semanticValue || "Chưa có biểu thức";
    if (!semanticValue) {
      this.previewContent.classList.add("empty");
    } else {
      this.previewContent.classList.remove("empty");
    }

    // Bắn ra component cha
    this.onChangeCallback(this.rawValue, semanticValue);
  }

  /**
   * Gắn sự kiện (Event Delegation)
   */
  bindEvents() {
    // Sự kiện gõ trực tiếp vào Textarea
    this.textarea.addEventListener("input", (e) => {
      this.rawValue = e.target.value;
      this.triggerChange();
    });

    // Event Delegation cho Toolbar (Click vào nút chèn)
    const toolbar = this.container.querySelector(".fb-toolbar");
    toolbar.addEventListener("click", (e) => {
      const btn = e.target.closest(".fb-btn");
      if (!btn) return;

      const textToInsert = btn.getAttribute("data-insert");
      const offset = parseInt(btn.getAttribute("data-offset") || "0", 10);

      if (textToInsert) {
        this.insertTextAtCursor(textToInsert, offset);
      }
    });
  }
}

// Export cho các script khác tái sử dụng nếu cần
window.FormulaBuilder = FormulaBuilder;

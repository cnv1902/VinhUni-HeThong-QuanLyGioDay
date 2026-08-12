class SemanticEditorDrawer {
    constructor(drawerId) {
        this.drawerId = drawerId;
        this.drawer = document.getElementById(drawerId);

        // --- State Management ---
        this.activeMenuId = 'lop_dong'; // 'lop_dong' hoặc caseId
        this.activeEditor = null;

        // Dữ liệu từ API
        this.tuDienBienSo = [];
        this.hinhThucDayData = [];
        this.truongHopData = [];
        this.lopDongData = [];
        this.originalData = null;

        this.cbHinhThucDay = null;

        // Các elements cố định
        this.DOM = {
            menuDynamic: document.getElementById('menuDynamic'),
            menuFixed: document.getElementById('menuFixed'),
            detailTitle: document.getElementById('detailTitle'),
            detailContent: document.getElementById('detailContent'),
            dictGroup: document.getElementById('dictGroup'),
            masterToolbar: document.getElementById('masterToolbar'),
            footerStatus: document.getElementById('footerStatus')
        };

        this.initEvents();
    }

    // ==========================================
    // LIFECYCLE
    // ==========================================
    async open(groupId, groupName) {
        this.currentGroupId = groupId;
        const titleEl = document.getElementById('drawerTitle');
        if (titleEl) titleEl.textContent = `Cấu hình Chi tiết: ${groupName || 'Nhóm Công Thức'}`;

        this.drawer.classList.add('active');

        if (this.tuDienBienSo.length === 0) {
            await this.loadDictionary();
        }
        this.renderDictionary();

        await this.loadDrawerData(groupId);

        this.activeMenuId = 'lop_dong';
        this.renderMenu();
        this.renderDetailView();

        // Khởi tạo ComboBox Thêm Trường Hợp
        const mappedHTD = this.hinhThucDayData.map(d => ({ id: d.MaHTDay, text: d.TenHTDay }));
        if (!this.cbHinhThucDay && typeof ComboBox !== 'undefined') {
            this.cbHinhThucDay = new ComboBox('#cbHinhThucDayContainer', {
                data: mappedHTD,
                placeholder: 'Chọn hoặc gõ tên hình thức dạy...'
            });
        } else if (this.cbHinhThucDay) {
            this.cbHinhThucDay.data = mappedHTD;
            this.cbHinhThucDay.clear();
        }

        // Khóa cuộn trang nền
        document.body.style.overflow = 'hidden';
    }

    checkIsDirty() {
        if (!this.originalData) return false;
        const currentSnapshot = JSON.stringify({
            lopDong: this.lopDongData,
            truongHop: this.truongHopData
        });
        return currentSnapshot !== this.originalData;
    }

    handleClose() {
        if (this.checkIsDirty()) {
            const isConfirm = confirm("Tab đang mở có dữ liệu thay đổi chưa được lưu. Bạn có chắc chắn muốn đóng và HỦY BỎ toàn bộ thay đổi này không?");
            if (!isConfirm) return;
        }
        this.close();
    }

    close() {
        if (this.drawer) {
            this.drawer.classList.remove('active');
        }
        this.currentGroupId = null;

        // Mở lại cuộn trang nền
        document.body.style.overflow = '';
    }

    // ==========================================
    // DATA LOADING
    // ==========================================
    async loadDictionary() {
        try {
            if (typeof apiCongThuc !== 'undefined') {
                const data = await apiCongThuc.getTuDienBienSo(1, 1);
                this.tuDienBienSo = data.data || data;

                if (typeof apiCongThuc.getHinhThucDay === 'function') {
                    const dataHTD = await apiCongThuc.getHinhThucDay();
                    this.hinhThucDayData = dataHTD.data || dataHTD;
                }
            } else {
                throw new Error('apiCongThuc is not defined');
            }
        } catch (err) {
            console.warn("Không tải được từ điển biến số từ API, dùng dữ liệu mẫu:", err);
            this.tuDienBienSo = [
                { MaBienSo: 'SoSV', TenHienThi: 'Số SV', NhomBien: 1 },
                { MaBienSo: 'SoTietLT', TenHienThi: 'Số tiết LT', NhomBien: 1 },
                { MaBienSo: 'SoTietTH', TenHienThi: 'Số tiết TH', NhomBien: 1 },
                { MaBienSo: 'HeSoLopDong', TenHienThi: 'Hệ số lớp đông', NhomBien: 2 }
            ];
            this.hinhThucDayData = [];
        }
    }

    async loadDrawerData(groupId) {
        try {
            const apiBase = (window.API_PREFIX || '/api/v1');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            // 1. Fetch Lớp đông
            const resLD = await fetch(`${apiBase}/he-so-lop-dong/nhom-cong-thuc/${groupId}`, { signal: controller.signal }).catch(e => null);
            if (resLD && resLD.ok) {
                const dataLD = await resLD.json();
                this.lopDongData = (dataLD.data || dataLD).map(item => ({
                    id: item.ID_HeSo_LD,
                    min: item.GiaTri_Min,
                    max: item.GiaTri_Max,
                    formula: item.BieuThuc_HeSoLopDong || ''
                }));
            } else {
                this.lopDongData = [];
            }

            // 2. Fetch Trường hợp dạy
            const resTH = await fetch(`${apiBase}/truong-hop-cong-thuc/nhom-cong-thuc/${groupId}`, { signal: controller.signal }).catch(e => null);
            clearTimeout(timeoutId);

            if (resTH && resTH.ok) {
                const dataTH = await resTH.json();
                this.truongHopData = (dataTH.data || dataTH).map(item => {
                    let expressions = [];
                    try {
                        if (item.BieuThuc_JSON) {
                            expressions = JSON.parse(item.BieuThuc_JSON);
                        }
                    } catch (e) {
                        console.warn("Lỗi parse BieuThuc_JSON", e);
                    }
                    
                    return {
                        id: item.ID_TruongHop_CT,
                        name: item.TenHTDay || `Hình thức dạy ${item.MaHTDay}`,
                        MaHTDay: item.MaHTDay,
                        expressions: expressions
                    };
                });
            } else {
                this.truongHopData = [];
            }
        } catch (e) {
            console.error("Lỗi khi fetch data cấu hình:", e);
            this.truongHopData = [];
            this.lopDongData = [];
        } finally {
            this.originalData = JSON.stringify({
                lopDong: this.lopDongData,
                truongHop: this.truongHopData
            });
        }
    }

    // ==========================================
    // RENDER UI
    // ==========================================
    renderDictionary() {
        if (!this.DOM.dictGroup) return;

        const grouped = {};
        this.tuDienBienSo.forEach(item => {
            const groupName = item.NhomBien || 'Khác';
            if (!grouped[groupName]) grouped[groupName] = [];
            grouped[groupName].push(item);
        });

        const html = Object.keys(grouped).map(groupName => `
            <div style="width: 100%; font-size: 11px; font-weight: 600; color: var(--text-secondary); margin-top: 8px; margin-bottom: 4px; text-transform: uppercase;">
                ${groupName}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${grouped[groupName].map(item =>
            `<button type="button" class="formula-btn-sm btn-var" data-insert="[${item.MaBienSo}]" title="${item.TenHienThi}">${item.TenHienThi}</button>`
        ).join('')}
            </div>
        `).join('');

        this.DOM.dictGroup.innerHTML = html;
        this.DOM.dictGroup.style.display = 'block';
    }

    renderMenu() {
        const isLopDongActive = this.activeMenuId === 'lop_dong' ? 'active' : '';
        const hasLopDongData = this.lopDongData.some(x => x.formula) ? 'has-data' : '';
        this.DOM.menuFixed.innerHTML = `
            <div class="md-menu-item ${isLopDongActive} ${hasLopDongData}" data-id="lop_dong">
                <span>Hệ số Lớp đông</span>
                <div class="status-dot"></div>
            </div>
        `;

        this.DOM.menuDynamic.innerHTML = this.truongHopData.map(item => {
            const isActive = String(this.activeMenuId) === String(item.id) ? 'active' : '';
            return `
                <div class="md-menu-item ${isActive}" data-id="${item.id}">
                    <span>${item.name}</span>
                    <span class="btn-delete-case" data-id="${item.id}">Xóa</span>
                </div>
            `;
        }).join('');
    }

    renderDetailView() {
        this.rescueToolbar();

        if (this.activeMenuId === 'lop_dong') {
            this.DOM.detailTitle.innerText = "Đang cấu hình: Hệ số Lớp đông";
            this.renderLopDongTable();
        } else {
            const item = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
            if (item) {
                this.DOM.detailTitle.innerText = `Đang cấu hình: ${item.name}`;
                this.renderTruongHopForm(item);
            }
        }
        this.activeEditor = null;
    }

    rescueToolbar() {
        // Cứu Toolbar khỏi bị phá hủy khi innerHTML của detailContent thay đổi
        if (this.DOM.masterToolbar && this.DOM.masterToolbar.parentNode) {
            this.DOM.masterToolbar.style.display = 'none';
            // Tạm cất Toolbar ra ngoài an toàn (cùng cấp với detailContent)
            this.DOM.detailContent.parentNode.insertBefore(this.DOM.masterToolbar, this.DOM.detailContent);
        }
    }

    renderLopDongTable() {
        let html = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 13px; font-weight: 500; color: var(--text-secondary);">
                    Cấu hình các mốc hệ số tùy theo sĩ số lớp thực tế.
                </span>
                <button type="button" class="btn btn-ghost btn-sm" id="btnAddLopDongRow" style="color: var(--brand-800); border-color: var(--brand-800);">
                    + Thêm mốc sĩ số
                </button>
            </div>`;

        html += `
            <div class="ld-grid-container">
                <div class="ld-grid-header">
                    <div>Từ</div>
                    <div>Đến</div>
                    <div>Biểu thức hệ số</div>
                    <div></div>
                </div>`;

        if (this.lopDongData.length === 0) {
            html += `<div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px;">
                Chưa có mốc sĩ số nào. Hãy nhấn "+ Thêm mốc sĩ số".
             </div>`;
        }

        this.lopDongData.forEach((row, index) => {
            html += `
            <div class="ld-grid-row" data-rowid="${row.id}">
                <div>
                    <input type="number" class="form-input ld-input-number dt-sync" data-field="min" value="${row.min || ''}">
                </div>
                <div>
                    <input type="number" class="form-input ld-input-number dt-sync" data-field="max" value="${row.max || ''}">
                </div>
                <div>
                    <textarea class="formula-target dt-sync" data-field="formula" placeholder="Nhấp chuột vào đây và sử dụng Toolbar...">${row.formula || ''}</textarea>
                    <div class="semantic-preview">${row.semantic_formula || this.translateToSemantic(row.formula)}</div>
                </div>
                <button type="button" class="btn-delete-row" title="Xóa mốc này">&times;</button>
            </div>`;
        });

        html += `</div>`; // Đóng ld-grid-container

        this.rescueToolbar();
        this.DOM.detailContent.innerHTML = html;
    }

    renderTruongHopForm(item) {
        this.rescueToolbar();
        let html = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 13px; font-weight: 500; color: var(--text-secondary);">
                    Danh sách các biểu thức tính toán cho trường hợp này. Các biểu thức sẽ được thực hiện tuần tự từ trên xuống dưới.
                </span>
                <button type="button" class="btn btn-ghost btn-sm" id="btnAddTruongHopRow" style="color: var(--brand-800); border-color: var(--brand-800);">
                    + Thêm dòng phép tính
                </button>
            </div>`;

        if (!item.expressions || item.expressions.length === 0) {
            html += `<div style="text-align: center; padding: 40px; color: var(--text-muted); border: 1px dashed var(--border-strong); border-radius: 6px;">
                Chưa có phép tính nào được cấu hình cho trường hợp này.
             </div>`;
        }

        (item.expressions || []).forEach((expr, index) => {
            html += `
            <div class="ld-card" data-index="${index}">
                <div class="ld-card-header">
                    <span class="ld-card-title">PHÉP TÍNH ${index + 1}</span>
                    <button type="button" class="btn btn-ghost btn-sm btn-delete-expr" style="color: var(--red-600); border:none; height: 24px;">✕ Xóa dòng</button>
                </div>
                
                <div class="ld-card-body">
                    <div>
                        <textarea class="formula-target dt-sync" data-field="formula" placeholder="Nhấp chuột vào đây và sử dụng Toolbar bên dưới để gõ công thức...">${expr.raw_formula || ''}</textarea>
                        <div class="semantic-preview">${expr.semantic_formula || this.translateToSemantic(expr.raw_formula)}</div>
                    </div>
                </div>
            </div>`;
        });

        this.DOM.detailContent.innerHTML = html;
    }

    // ==========================================
    // SEMANTIC TRANSLATOR
    // ==========================================
    translateToSemantic(rawString) {
        if (!rawString || !rawString.trim()) return `<em>— Chưa có công thức —</em>`;
        let escaped = rawString.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        this.tuDienBienSo.forEach(dict => {
            const regex = new RegExp('\\b' + dict.MaBienSo + '\\b', 'g');
            escaped = escaped.replace(regex, `<span class="tk tk-var">${dict.TenHienThi}</span>`);
        });

        escaped = escaped
            .replace(/\bROUND\b/g, '<span class="tk tk-func">LÀM_TRÒN</span>')
            .replace(/\bIIF\b/g, '<span class="tk tk-func">NẾU</span>');
        return escaped;
    }

    // ==========================================
    // EVENT DELEGATION
    // ==========================================
    initEvents() {
        const btnClose = document.getElementById('btnCloseDrawer');
        if (btnClose) btnClose.addEventListener('click', () => this.handleClose());

        const btnCancel = document.getElementById('btnCancelDrawer');
        if (btnCancel) btnCancel.addEventListener('click', () => this.handleClose());

        const btnSave = document.getElementById('btnSaveConfig');
        if (btnSave) btnSave.addEventListener('click', () => this.saveConfig());

        // --- CLICK OUTSIDE TO CLOSE ---
        if (this.drawer) {
            this.drawer.addEventListener('mousedown', (e) => {
                if (e.target === this.drawer) {
                    this.handleClose();
                }
            });
        }

        // --- MENU NAVIGATION ---
        document.querySelector('.md-master').addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-delete-case')) {
                e.stopPropagation();
                const caseId = e.target.dataset.id;
                if (!confirm("Xóa trường hợp dạy này? Hành động này sẽ xóa ngay lập tức trên hệ thống!")) return;

                if (typeof caseId === 'string' && !caseId.startsWith('th_')) {
                    try {
                        const url = `${window.API_PREFIX || '/api/v1'}/truong-hop-cong-thuc/${caseId}`;
                        const res = await fetch(url, { method: 'DELETE' });
                        if (!res.ok) throw new Error("Lỗi khi xóa từ server");
                    } catch (err) {
                        console.error(err);
                        if (typeof showToast !== 'undefined') showToast("Xóa thất bại!", "error");
                        return;
                    }
                }

                this.truongHopData = this.truongHopData.filter(x => String(x.id) !== String(caseId));
                if (String(this.activeMenuId) === String(caseId)) {
                    this.activeMenuId = 'lop_dong';
                    this.renderDetailView();
                }
                this.renderMenu();
                if (typeof showToast !== 'undefined') showToast("Đã xóa trường hợp!", "success");
                return;
            }

            const item = e.target.closest('.md-menu-item');
            if (item) {
                this.activeMenuId = item.dataset.id;
                this.renderMenu();
                this.renderDetailView();
            }
        });

        // --- THÊM TRƯỜNG HỢP DẠY MỚI ---
        document.getElementById('btnAddFormat').addEventListener('click', () => {
            if (!this.cbHinhThucDay) return;
            // Combo box trả về selectedId (getValue) và text của input
            const selectedId = this.cbHinhThucDay.getValue();
            const val = this.cbHinhThucDay.inputField.value.trim();
            if (!val) return alert("Vui lòng chọn hoặc nhập tên hình thức dạy!");

            if (this.truongHopData.some(x => x.name.toLowerCase() === val.toLowerCase())) {
                return alert("Trường hợp này đã tồn tại!");
            }

            const newId = 'th_' + Date.now();
            this.truongHopData.push({
                id: newId,
                name: val,
                MaHTDay: selectedId || null,
                expressions: []
            });

            this.cbHinhThucDay.clear();
            this.activeMenuId = newId;
            this.renderMenu();
            this.renderDetailView();
        });

        // --- DATA BINDING THỦ CÔNG ---
        this.DOM.detailContent.addEventListener('input', (e) => {
            const el = e.target;
            if (!el.classList.contains('dt-sync')) return;

            const field = el.dataset.field;
            const val = el.value;

            if (this.activeMenuId === 'lop_dong') {
                const rowEl = el.closest('.ld-grid-row');
                if (rowEl) {
                    const rowId = rowEl.dataset.rowid;
                    const row = this.lopDongData.find(x => String(x.id) === rowId);
                    if (row) row[field] = val;
                }
            } else {
                const index = el.closest('.ld-card').dataset.index;
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (th && th.expressions[index]) {
                    th.expressions[index].raw_formula = val;
                    th.expressions[index].semantic_formula = this.translateToSemantic(val);
                }
            }

            if (el.classList.contains('formula-target')) {
                const previewEl = el.parentNode.querySelector('.semantic-preview');
                if (previewEl) previewEl.innerHTML = this.translateToSemantic(val);
            }

            this.renderMenu(); // Cập nhật chấm xanh
        });

        // --- TRACKING CON TRỎ VÀ DI CHUYỂN TOOLBAR ---
        this.DOM.detailContent.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('formula-target')) {
                this.activeEditor = e.target;

                // Cắt Toolbar hiện tại và chèn vào ngay sau thẻ Textarea đang focus
                if (this.DOM.masterToolbar.parentNode !== e.target.parentNode || this.DOM.masterToolbar.previousElementSibling !== e.target) {
                    e.target.parentNode.insertBefore(this.DOM.masterToolbar, e.target.nextSibling);
                }

                this.DOM.masterToolbar.style.display = 'flex';
            }
        });

        this.DOM.detailContent.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('formula-target')) {
                // Không ẩn ngay lập tức để xử lý click mousedown vào toolbar
                // Sẽ ẩn sau 1 khoảng nhỏ, nếu focus thực sự đã ra ngoài
                setTimeout(() => {
                    if (document.activeElement !== this.activeEditor && !this.DOM.masterToolbar.contains(document.activeElement)) {
                        this.DOM.masterToolbar.style.display = 'none';
                    }
                }, 50);
            }
        });

        // BẮT BUỘC: Xử lý bug mất focus khi click Toolbar
        this.DOM.masterToolbar.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        // --- CHÈN TỪ TOOLBAR ---
        this.DOM.masterToolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-insert]');
            if (!btn) return;

            if (!this.activeEditor) {
                alert("Vui lòng nhấp vào một ô công thức trước khi chèn!");
                return;
            }

            const textToInsert = btn.dataset.insert;
            const offset = parseInt(btn.dataset.offset || '0', 10);

            const editor = this.activeEditor;
            const startPos = editor.selectionStart;
            const endPos = editor.selectionEnd;

            editor.value = editor.value.substring(0, startPos) + textToInsert + editor.value.substring(endPos);
            editor.dispatchEvent(new Event('input', { bubbles: true }));

            editor.focus();
            const newPos = startPos + textToInsert.length + offset;
            editor.setSelectionRange(newPos, newPos);
        });

        // --- HÀNH ĐỘNG CHO CÁC ROW (LỚP ĐÔNG & TRƯỜNG HỢP) ---
        this.DOM.detailContent.addEventListener('click', async (e) => {
            if (e.target.id === 'btnAddLopDongRow') {
                this.lopDongData.push({
                    id: 'ld_' + Date.now(),
                    min: '', max: '', formula: ''
                });
                this.renderLopDongTable();
                this.renderMenu();
            }
            if (e.target.id === 'btnAddTruongHopRow') {
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (th) {
                    if (!th.expressions) th.expressions = [];
                    th.expressions.push({
                        id: 'expr_' + Date.now(),
                        raw_formula: '',
                        semantic_formula: ''
                    });
                    this.renderTruongHopForm(th);
                    this.renderMenu();
                }
            }
            if (e.target.classList.contains('btn-delete-row')) {
                let isOk = false;
                if (typeof confirmModal !== 'undefined') {
                    isOk = await confirmModal.show("Bạn có chắc chắn muốn xóa mốc sĩ số này không?", "Xác nhận xóa mốc sĩ số");
                } else {
                    isOk = confirm("Bạn có chắc chắn muốn xóa mốc sĩ số này không?");
                }
                
                if (!isOk) return;

                const rowEl = e.target.closest('.ld-grid-row');
                if (rowEl) {
                    const rowId = rowEl.dataset.rowid;
                    this.lopDongData = this.lopDongData.filter(x => String(x.id) !== String(rowId));
                    this.renderLopDongTable();
                    this.renderMenu();
                }
            }
            if (e.target.classList.contains('btn-delete-expr')) {
                let isOk = false;
                if (typeof confirmModal !== 'undefined') {
                    isOk = await confirmModal.show("Bạn có chắc chắn muốn xóa phép tính này không?", "Xác nhận xóa phép tính");
                } else {
                    isOk = confirm("Bạn có chắc chắn muốn xóa phép tính này không?");
                }
                
                if (!isOk) return;

                const index = parseInt(e.target.closest('.ld-card').dataset.index, 10);
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (th && th.expressions) {
                    th.expressions.splice(index, 1);
                    this.renderTruongHopForm(th);
                    this.renderMenu();
                }
            }
        });
    }

    // ==========================================
    // LƯU CẤU HÌNH (SAVE)
    // ==========================================
    async saveConfig() {
        if (!this.currentGroupId) return;
        const btnSave = document.getElementById('btnSaveConfig');
        const originalText = btnSave.textContent;

        try {
            btnSave.disabled = true;
            btnSave.textContent = 'Đang lưu...';

            // 1. Chuẩn bị dữ liệu Hệ số lớp đông
            const he_so_lop_dong = this.lopDongData.map(item => ({
                ID_HeSo_LD: typeof item.id === 'string' ? null : parseInt(item.id, 10),
                GiaTri_Min: parseInt(item.min, 10) || 0,
                GiaTri_Max: parseInt(item.max, 10) || 0,
                BieuThuc_HeSoLopDong: item.formula || ""
            })).filter(x => x.BieuThuc_HeSoLopDong.trim() !== "");

            // 2. Chuẩn bị dữ liệu Trường hợp công thức
            const truong_hop_cong_thuc = this.truongHopData.map(item => {
                const validExpressions = (item.expressions || []).filter(e => e.raw_formula && e.raw_formula.trim() !== '');
                const bieuThucText = validExpressions.map(e => e.raw_formula).join('\n');
                let bieuThucJson = null;

                if (validExpressions.length > 0) {
                    validExpressions.forEach(e => {
                        e.semantic_formula = this.translateToSemantic(e.raw_formula).replace(/(<([^>]+)>)/gi, "");
                    });
                    bieuThucJson = JSON.stringify(validExpressions);
                }

                return {
                    ID_TruongHop_CT: typeof item.id === 'string' ? null : parseInt(item.id, 10),
                    MaHTDay: item.MaHTDay || null,
                    BieuThuc_JSON: bieuThucJson,
                    BieuThuc_Text: bieuThucText,
                    TrangThai: true
                };
            });

            const payload = {
                he_so_lop_dong: he_so_lop_dong,
                truong_hop_cong_thuc: truong_hop_cong_thuc
            };

            const url = `${window.API_PREFIX || '/api/v1'}/nhom-cong-thuc/${this.currentGroupId}/bulk-update`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Lỗi lưu cấu hình: " + await response.text());
            }

            if (typeof showToast !== 'undefined') showToast("Lưu cấu hình thành công!", "success");
            
            // Xóa trạng thái Dirty bằng cách chụp lại snapshot mới
            this.originalData = JSON.stringify({
                lopDong: this.lopDongData,
                truongHop: this.truongHopData
            });
            // Tuyệt đối không đóng Drawer


        } catch (error) {
            console.error(error);
            if (typeof showToast !== 'undefined') showToast(error.message || "Có lỗi xảy ra khi lưu!", "error");
        } finally {
            btnSave.disabled = false;
            btnSave.textContent = originalText;
        }
    }
}


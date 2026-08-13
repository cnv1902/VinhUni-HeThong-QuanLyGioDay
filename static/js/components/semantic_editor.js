class SemanticEditorDrawer {
    constructor(drawerId) {
        this.drawerId = drawerId;
        this.drawer = document.getElementById(drawerId);

        // --- State Management ---
        this.activeMenuId = null; // ID của Trường hợp công thức hoặc 'lop_dong'
        this.activeEditor = null;

        // Dữ liệu từ API
        this.tuDienBienSo = [];
        this.hinhThucDayData = [];
        this.truongHopData = [];
        this.danhSachHeSoLopDong = []; // Dành cho dropdown
        this.fullHeSoData = null; // Lazy load full JSON

        this.originalData = null; // Dùng để kiểm tra dirty state

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

        // Mặc định chọn Tab Trường hợp công thức đầu tiên
        if (this.truongHopData.length > 0) {
            this.activeMenuId = this.truongHopData[0].id;
        } else {
            this.activeMenuId = null;
        }

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

        let currentSnapshot = "";
        if (this.activeMenuId === 'lop_dong') {
            currentSnapshot = JSON.stringify(this.fullHeSoData);
            return currentSnapshot !== this.originalData;
        } else {
            currentSnapshot = JSON.stringify(this.truongHopData);
            return currentSnapshot !== this.originalData;
        }
    }

    handleClose() {
        if (this.checkIsDirty()) {
            // Dùng Toast không chặn luồng được, nên đành dùng window.confirm theo mặc định, nhưng đổi câu văn 
            const isConfirm = window.confirm("Cấu hình có thay đổi chưa được lưu. Bạn có chắc chắn đóng không?");
            if (!isConfirm) return;
        }
        this.close();
    }

    close() {
        if (this.drawer) {
            this.drawer.classList.remove('active');
        }
        this.currentGroupId = null;
        this.fullHeSoData = null; // Clear lazy load data

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
            }
        } catch (err) {
            console.warn("Lỗi load dictionary:", err);
            this.tuDienBienSo = [];
            this.hinhThucDayData = [];
        }
    }

    async loadDrawerData(groupId) {
        try {
            const apiBase = (window.API_PREFIX || '/api/v1');

            // Lấy danh sách rút gọn Hệ số lớp đông cho Combobox
            const resHSDG = await fetch(`${apiBase}/he-so-lop-dong/danh-sach-don-gian`).catch(e => null);
            if (resHSDG && resHSDG.ok) {
                this.danhSachHeSoLopDong = await resHSDG.json();
            } else {
                this.danhSachHeSoLopDong = [];
            }

            // Fetch Trường hợp dạy
            const resTH = await fetch(`${apiBase}/truong-hop-cong-thuc/nhom-cong-thuc/${groupId}`).catch(e => null);
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
                        ID_HeSo_LD: item.ID_HeSo_LD,
                        expressions: expressions
                    };
                });
            } else {
                this.truongHopData = [];
            }

            this.originalData = JSON.stringify(this.truongHopData);

        } catch (e) {
            console.error("Lỗi khi fetch data cấu hình:", e);
            this.truongHopData = [];
        }
    }

    async lazyLoadHeSoLopDong() {
        if (this.fullHeSoData !== null) return; // Đã load

        try {
            const apiBase = (window.API_PREFIX || '/api/v1');
            const res = await fetch(`${apiBase}/he-so-lop-dong/`);
            if (res.ok) {
                const data = await res.json();
                this.fullHeSoData = data.map(item => {
                    let rows = [];
                    try {
                        if (item.CauHinh_Json) {
                            rows = JSON.parse(item.CauHinh_Json);
                        }
                    } catch (e) { }
                    return {
                        ID_HeSo_LD: item.ID_HeSo_LD,
                        Ten_HeSo_LD: item.Ten_HeSo_LD,
                        TrangThai: item.TrangThai,
                        rows: rows
                    };
                });
            } else {
                this.fullHeSoData = [];
            }
        } catch (e) {
            console.error(e);
            this.fullHeSoData = [];
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
            `<button type="button" class="formula-btn-sm btn-var" data-insert="[${item.TenHienThi}]" title="${item.TenHienThi}">${item.TenHienThi}</button>`
        ).join('')}
            </div>
        `).join('');

        this.DOM.dictGroup.innerHTML = html;
        this.DOM.dictGroup.style.display = 'block';
    }

    renderMenu() {
        const isLopDongActive = this.activeMenuId === 'lop_dong' ? 'active' : '';
        this.DOM.menuFixed.innerHTML = `
            <div class="md-menu-item ${isLopDongActive}" data-id="lop_dong">
                <span>Hệ số Lớp đông</span>
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

    async renderDetailView() {
        this.rescueToolbar();

        if (this.activeMenuId === 'lop_dong') {
            this.DOM.detailTitle.innerText = "Cấu hình Từ điển Hệ số Lớp đông";
            await this.lazyLoadHeSoLopDong();
            this.originalData = JSON.stringify(this.fullHeSoData);
            this.renderLopDongTable();
        } else if (this.activeMenuId === null) {
            this.DOM.detailTitle.innerText = "";
            this.DOM.detailContent.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px;">
                    Chưa có công thức nào được áp dụng.
                </div>
            `;
        } else {
            const item = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
            if (item) {
                this.DOM.detailTitle.innerText = `Đang cấu hình: ${item.name}`;
                this.originalData = JSON.stringify(this.truongHopData);
                this.renderTruongHopForm(item);
            }
        }
        this.activeEditor = null;
    }

    rescueToolbar() {
        if (this.DOM.masterToolbar) {
            this.DOM.masterToolbar.style.display = 'none';
            // Không dời DOM nữa, toolbar sẽ luôn nằm yên ở cuối .md-detail
        }
    }

    renderLopDongTable() {
        let html = '';

        // Thêm nút Tạo mẫu mới lên header
        const detailTitle = document.getElementById('detailTitle');
        if (detailTitle && detailTitle.parentNode) {
            let headerWrapper = detailTitle.parentNode;
            if (!headerWrapper.querySelector('#btnAddHsldGroup')) {
                headerWrapper.style.display = 'flex';
                headerWrapper.style.justifyContent = 'space-between';
                headerWrapper.style.alignItems = 'center';
                const btnHtml = `<button type="button" class="btn btn-ghost btn-sm" id="btnAddHsldGroup" style="color: var(--brand-800); border-color: var(--border-strong);">
                                    + Tạo mẫu mới
                                </button>`;
                headerWrapper.insertAdjacentHTML('beforeend', btnHtml);
            } else {
                headerWrapper.querySelector('#btnAddHsldGroup').style.display = 'block';
            }
        }
        if (!this.fullHeSoData || this.fullHeSoData.length === 0) {
            html += `<div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px;">
                Chưa có mẫu hệ số lớp đông nào. Hãy tạo mẫu mới.
             </div>`;
        } else {
            this.fullHeSoData.forEach((group, gIndex) => {
                html += `
                <div class="hsld-group-block" style="margin-bottom: 24px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border);">
                    <!-- Header -->
                    <div style="background: var(--bg-subtle-2); border-left: 4px solid var(--brand-800); padding-top: 6px; padding-bottom: 6px; padding-left: 12px; display: flex; justify-content: space-between; align-items: center;">
                        ${group.Ten_HeSo_LD ?
                        `<input type="text" class="form-input dt-sync-group hsld-title-input" data-gindex="${gIndex}" data-field="Ten_HeSo_LD" value="${group.Ten_HeSo_LD}" style="font-weight: 600; width: 250px; background: transparent; border-color: transparent; box-shadow: none; font-size: 14px;" title="Sửa tên nhóm"></input>` :
                        `<input type="text" class="form-input dt-sync-group hsld-title-input" data-gindex="${gIndex}" data-field="Ten_HeSo_LD" value="${'Nhấp để đặt tên nhóm'}" style="width: 250px; background: transparent; border-color: transparent; box-shadow: none; font-size: 14px;" title="Sửa tên nhóm"></input>`
                    }
                        <div>
                            <button type="button" class="btn btn-ghost btn-sm btn-add-hsld-row" data-gindex="${gIndex}" style="margin-right: 8px;">
                                + Thêm mốc sĩ số
                            </button>
                            <button type="button" class="btn btn-ghost btn-sm btn-delete-hsld-group" data-gindex="${gIndex}" style="color: var(--red-600); border-color: transparent;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg> Xóa
                            </button>
                        </div>
                    </div>
                    <!-- Body -->
                    <div style="padding: 16px; padding-left: 20px; background: var(--bg-panel);">
                        <div class="ld-grid-container" style="border: none; padding: 0;">
                            <div class="ld-grid-header">
                                <div>Từ</div>
                                <div>Đến</div>
                                <div>Biểu thức hệ số</div>
                                <div></div>
                            </div>`;

                if (!group.rows || group.rows.length === 0) {
                    html += `<div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px;">Chưa có mốc sĩ số.</div>`;
                } else {
                    group.rows.forEach((row, rIndex) => {
                        html += `
                        <div class="ld-grid-row" style="background: transparent;">
                            <div>
                                <input type="number" class="form-input ld-input-number dt-sync-row" data-gindex="${gIndex}" data-rindex="${rIndex}" data-field="min" value="${row.min !== null && row.min !== undefined && row.min !== '' ? row.min : ''}">
                            </div>
                            <div>
                                <input type="number" class="form-input ld-input-number dt-sync-row" data-gindex="${gIndex}" data-rindex="${rIndex}" data-field="max" value="${row.max !== null && row.max !== undefined && row.max !== '' ? row.max : ''}" placeholder="∞">
                            </div>
                            <div>
                                <textarea class="formula-target dt-sync-row" data-gindex="${gIndex}" data-rindex="${rIndex}" data-field="formula" placeholder="Nhấp chuột vào đây...">${row.semantic_formula || this.toSemanticText(row.formula)}</textarea>
                                <div class="semantic-preview">${this.previewHTML(row.semantic_formula || this.toSemanticText(row.formula))}</div>
                            </div>
                            <button type="button" class="btn-delete-row" data-gindex="${gIndex}" data-rindex="${rIndex}" title="Xóa mốc này">&times;</button>
                        </div>`;
                    });
                }

                html += `
                        </div>
                    </div>
                </div>`;
            });
        }

        this.DOM.detailContent.innerHTML = html;
    }

    renderTruongHopForm(item) {
        // Ẩn nút tạo mẫu ở header nếu đang ở tab Trường hợp
        const headerBtn = document.getElementById('btnAddHsldGroup');
        if (headerBtn) headerBtn.style.display = 'none';

        this.rescueToolbar();
        let html = `
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; display: block;">Áp dụng Hệ số lớp đông (Tùy chọn)</label>
                <select class="form-input dt-sync-th" data-field="ID_HeSo_LD" style="max-width: 400px; height: 32px; border-radius: 6px;">
                    <option value="">-- Không áp dụng Hệ số lớp đông --</option>
                    ${this.danhSachHeSoLopDong.map(opt => `
                        <option value="${opt.ID_HeSo_LD}" ${String(item.ID_HeSo_LD) === String(opt.ID_HeSo_LD) ? 'selected' : ''}>${opt.Ten_HeSo_LD}</option>
                    `).join('')}
                </select>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <span style="font-size: 13px; font-weight: 500; color: var(--text-secondary);">
                    Danh sách phép tính (Thực hiện tuần tự)
                </span>
                <button type="button" class="btn btn-ghost btn-sm" id="btnAddTruongHopRow" style="color: var(--brand-800); border-color: var(--border-strong);">
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
                <div class="ld-card-header" style="background: var(--bg-subtle-2);">
                    <span class="ld-card-title">PHÉP TÍNH ${index + 1}</span>
                    <button type="button" class="btn btn-ghost btn-sm btn-delete-expr" style="color: var(--red-600); border:none; height: 24px;">✕ Xóa dòng</button>
                </div>
                
                <div class="ld-card-body">
                    <div>
                        <textarea class="formula-target dt-sync-expr" data-field="formula" placeholder="Nhấp chuột vào đây...">${expr.semantic_formula || this.toSemanticText(expr.raw_formula)}</textarea>
                        <div class="semantic-preview">${this.previewHTML(expr.semantic_formula || this.toSemanticText(expr.raw_formula))}</div>
                    </div>
                </div>
            </div>`;
        });

        this.DOM.detailContent.innerHTML = html;
    }

    // ==========================================
    // SEMANTIC TRANSLATOR
    // ==========================================
    toSemanticText(rawString) {
        if (!rawString) return "";
        let text = rawString;
        this.tuDienBienSo.forEach(dict => {
            const search = `[${dict.MaBienSo}]`;
            const replace = `[${dict.TenHienThi}]`;
            text = text.split(search).join(replace);
        });
        text = text.split('ROUND').join('LÀM_TRÒN').split('IF').join('NẾU').split('IIF').join('NẾU');
        return text;
    }

    toRawText(semanticString) {
        if (!semanticString) return "";
        let raw = semanticString;
        this.tuDienBienSo.forEach(dict => {
            const search = `[${dict.TenHienThi}]`;
            const replace = `[${dict.MaBienSo}]`;
            raw = raw.split(search).join(replace);
        });
        raw = raw.split('LÀM_TRÒN').join('ROUND').split('NẾU').join('IF');
        return raw;
    }

    previewHTML(semanticText) {
        if (!semanticText || !semanticText.trim()) return `<em>— Chưa có công thức —</em>`;
        let escaped = semanticText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        this.tuDienBienSo.forEach(dict => {
            const search = `[${dict.TenHienThi}]`;
            const replace = `[<span class="tk tk-var">${dict.TenHienThi}</span>]`;
            escaped = escaped.split(search).join(replace);
        });

        escaped = escaped
            .split('LÀM_TRÒN').join('<span class="tk tk-func">LÀM_TRÒN</span>')
            .split('NẾU').join('<span class="tk tk-func">NẾU</span>');
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

        if (this.drawer) {
            this.drawer.addEventListener('mousedown', (e) => {
                if (e.target === this.drawer) this.handleClose();
            });
        }

        // --- MENU NAVIGATION ---
        document.querySelector('.md-master').addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-delete-case')) {
                e.stopPropagation();
                const caseId = e.target.dataset.id;

                let isOk = false;
                if (typeof confirmModal !== 'undefined') {
                    isOk = await confirmModal.show("Xóa trường hợp dạy này? Hành động này sẽ xóa ngay lập tức trên hệ thống!", "Xóa Trường Hợp");
                } else {
                    isOk = window.confirm("Xóa trường hợp dạy này? Hành động này sẽ xóa ngay lập tức trên hệ thống!");
                }
                if (!isOk) return;

                if (typeof caseId === 'string' && !caseId.startsWith('th_')) {
                    try {
                        const url = `${window.API_PREFIX || '/api/v1'}/truong-hop-cong-thuc/${caseId}`;
                        const res = await fetch(url, { method: 'DELETE' });
                        if (!res.ok) {
                            const errorData = await res.json().catch(() => null);
                            throw new Error(errorData && errorData.detail ? errorData.detail : "Lỗi khi xóa từ server");
                        }
                    } catch (err) {
                        if (typeof showToast !== 'undefined') showToast("Xóa thất bại: " + err.message);
                        return;
                    }
                }

                this.truongHopData = this.truongHopData.filter(x => String(x.id) !== String(caseId));
                if (String(this.activeMenuId) === String(caseId)) {
                    this.activeMenuId = 'lop_dong';
                    this.renderDetailView();
                }
                this.renderMenu();
                if (typeof showToast !== 'undefined') showToast("Đã xóa trường hợp!");
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
            const selectedId = this.cbHinhThucDay.getValue();
            const val = this.cbHinhThucDay.inputField.value.trim();
            if (!val) {
                if (typeof showToast !== 'undefined') showToast("Vui lòng chọn hoặc nhập tên hình thức dạy!");
                return;
            }

            if (this.truongHopData.some(x => x.name.toLowerCase() === val.toLowerCase())) {
                if (typeof showToast !== 'undefined') showToast("Trường hợp này đã tồn tại!");
                return;
            }

            const newId = 'th_' + Date.now();
            this.truongHopData.push({
                id: newId,
                name: val,
                MaHTDay: selectedId || null,
                ID_HeSo_LD: null,
                expressions: []
            });

            this.cbHinhThucDay.clear();
            this.activeMenuId = newId;
            this.renderMenu();
            this.renderDetailView();
        });

        // --- DATA BINDING THỦ CÔNG & DIRTY STATE ---
        this.DOM.detailContent.addEventListener('input', (e) => {
            const el = e.target;
            const field = el.dataset.field;
            const val = el.value;

            // Đánh dấu dirty ui rules (nền amber-50)
            const rowEl = el.closest('.ld-grid-row') || el.closest('.ld-card') || el.closest('.hsld-group-block');
            if (rowEl) rowEl.style.backgroundColor = 'var(--amber-50)';

            if (el.classList.contains('dt-sync-group')) {
                const gIndex = el.dataset.gindex;
                if (this.fullHeSoData[gIndex]) {
                    this.fullHeSoData[gIndex][field] = val;
                }
            } else if (el.classList.contains('dt-sync-row')) {
                const gIndex = el.dataset.gindex;
                const rIndex = el.dataset.rindex;
                const row = this.fullHeSoData[gIndex].rows[rIndex];
                if (row) {
                    if (field === 'formula') {
                        row.formula = this.toRawText(val);
                        row.semantic_formula = val;
                    } else {
                        row[field] = val;
                    }
                }
            } else if (el.classList.contains('dt-sync-th')) {
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (th) {
                    th[field] = val ? parseInt(val) : null;
                }
            } else if (el.classList.contains('dt-sync-expr')) {
                const index = el.closest('.ld-card').dataset.index;
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (th && th.expressions[index]) {
                    th.expressions[index].raw_formula = this.toRawText(val);
                    th.expressions[index].semantic_formula = val;
                }
            }

            if (el.classList.contains('formula-target')) {
                const previewEl = el.parentNode.querySelector('.semantic-preview');
                if (previewEl) previewEl.innerHTML = this.previewHTML(val);
            }
        });

        // --- CÁC NÚT ĐỘNG TRONG DETAIL CONTENT VÀ HEADER ---
        this.DOM.detailContent.parentNode.addEventListener('click', (e) => {
            // Thêm mốc hệ số lớp đông
            if (e.target.closest('.btn-add-hsld-row')) {
                const gIndex = e.target.closest('.btn-add-hsld-row').dataset.gindex;
                this.fullHeSoData[gIndex].rows.push({ id: 'ld_' + Date.now(), min: '', max: '', formula: '', semantic_formula: '' });
                this.renderDetailView();
            }
            // Xóa mốc hệ số lớp đông
            else if (e.target.closest('.btn-delete-row')) {
                const gIndex = e.target.closest('.btn-delete-row').dataset.gindex;
                const rIndex = e.target.closest('.btn-delete-row').dataset.rindex;
                this.fullHeSoData[gIndex].rows.splice(rIndex, 1);
                this.renderDetailView();
            }
            // Xóa nhóm hệ số lớp đông
            else if (e.target.closest('.btn-delete-hsld-group')) {
                const gIndex = e.target.closest('.btn-delete-hsld-group').dataset.gindex;
                if (typeof confirmModal !== 'undefined') {
                    confirmModal.show("Bạn có chắc chắn muốn xóa mẫu này? Sẽ cần bấm Lưu để áp dụng trên máy chủ.", "Xóa Mẫu Cấu Hình").then(isOk => {
                        if (isOk) {
                            this.fullHeSoData.splice(gIndex, 1);
                            this.renderDetailView();
                        }
                    });
                } else {
                    if (!window.confirm("Xóa toàn bộ cấu hình mẫu này?")) return;
                    this.fullHeSoData.splice(gIndex, 1);
                    this.renderDetailView();
                }
            }
            // Tạo nhóm hệ số lớp đông mới
            else if (e.target.closest('#btnAddHsldGroup')) {
                // Focus vào input tên ngay sau khi tạo
                this.fullHeSoData.unshift({ // Cho lên đầu danh sách để thấy ngay
                    ID_HeSo_LD: null,
                    Ten_HeSo_LD: '', // Tên rỗng để buộc nhập
                    TrangThai: true,
                    rows: []
                });
                this.renderDetailView().then(() => {
                    const firstInput = this.DOM.detailContent.querySelector('.hsld-title-input');
                    if (firstInput) {
                        firstInput.focus();
                        firstInput.closest('.hsld-group-block').style.backgroundColor = 'var(--amber-50)';
                    }
                });
            }
            // Thêm phép tính trường hợp
            else if (e.target.closest('#btnAddTruongHopRow')) {
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (th) {
                    if (!th.expressions) th.expressions = [];
                    th.expressions.push({ id: 'expr_' + Date.now(), raw_formula: '', semantic_formula: '' });
                    this.renderDetailView();
                }
            }
            // Xóa phép tính trường hợp
            else if (e.target.closest('.btn-delete-expr')) {
                const index = e.target.closest('.ld-card').dataset.index;
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (th) {
                    th.expressions.splice(index, 1);
                    this.renderDetailView();
                }
            }
        });

        // --- XỬ LÝ FOCUS TEXTAREA HIỂN THỊ TOOLBAR ---
        this.DOM.detailContent.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('formula-target')) {
                this.activeEditor = e.target;
                if (this.DOM.masterToolbar) {
                    this.DOM.masterToolbar.style.display = 'flex'; // Dùng flex vì theo CSS mới
                }
            }
        });

        this.DOM.detailContent.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('formula-target')) {
                if (this.DOM.masterToolbar) {
                    this.DOM.masterToolbar.style.display = 'none';
                }
            }
        });

        // --- NÚT TRÊN TOOLBAR (CHÈN BIẾN/HÀM) ---
        if (this.DOM.masterToolbar) {
            this.DOM.masterToolbar.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Tránh mất focus textarea
                const btn = e.target.closest('button');
                if (!btn || !this.activeEditor) return;

                const insertText = btn.dataset.insert;
                const offset = parseInt(btn.dataset.offset || "0");

                if (insertText) {
                    const start = this.activeEditor.selectionStart;
                    const end = this.activeEditor.selectionEnd;
                    const text = this.activeEditor.value;

                    const before = text.substring(0, start);
                    const after = text.substring(end);

                    this.activeEditor.value = before + insertText + after;
                    this.activeEditor.selectionStart = this.activeEditor.selectionEnd = start + insertText.length + offset;

                    // Trigger sự kiện input thủ công
                    this.activeEditor.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }
    }

    // ==========================================
    // SAVE LOGIC
    // ==========================================
    async saveConfig() {
        const btnSave = document.getElementById('btnSaveConfig');
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = '<span class="spinner" style="width: 14px; height: 14px; margin-right: 6px; display: inline-block; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;"></span> Đang lưu...';
        btnSave.disabled = true;

        try {
            const apiBase = (window.API_PREFIX || '/api/v1');

            if (this.activeMenuId === 'lop_dong') {
                // 1. LƯU HỆ SỐ LỚP ĐÔNG
                const payload = this.fullHeSoData.map(group => {
                    const validRows = group.rows
                        .filter(r => (r.min !== '' && r.min !== null) && r.formula && r.formula.trim() !== '')
                        .map(r => ({
                            ...r,
                            min: Number(r.min),
                            max: (r.max === '' || r.max === null) ? null : Number(r.max)
                        }));
                    return {
                        ID_HeSo_LD: group.ID_HeSo_LD,
                        Ten_HeSo_LD: group.Ten_HeSo_LD,
                        CauHinh_Json: validRows.length > 0 ? JSON.stringify(validRows) : null,
                        TrangThai: group.TrangThai
                    };
                });

                const res = await fetch(`${apiBase}/he-so-lop-dong/bulk-update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ he_so_lop_dong: payload })
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => null);
                    const errMsg = errorData && errorData.detail ? errorData.detail : "Lỗi khi lưu Hệ số lớp đông";
                    throw new Error(errMsg);
                }

                if (typeof showToast !== 'undefined') showToast("Đã lưu Hệ số lớp đông thành công!");

                // Tải lại
                this.fullHeSoData = null;
                await this.lazyLoadHeSoLopDong();
                this.originalData = JSON.stringify(this.fullHeSoData);
                this.renderDetailView();

            } else {
                // 2. LƯU TRƯỜNG HỢP CÔNG THỨC
                const th = this.truongHopData.find(x => String(x.id) === String(this.activeMenuId));
                if (!th) throw new Error("Không tìm thấy trường hợp công thức");

                // Chuẩn hóa dữ liệu toàn bộ nhóm
                const validTruongHop = this.truongHopData.map(t => {
                    const validExpressions = (t.expressions || []).filter(e => e.raw_formula && e.raw_formula.trim() !== '');
                    return {
                        ID_TruongHop_CT: typeof t.id === 'string' && t.id.startsWith('th_') ? null : parseInt(t.id),
                        ID_HeSo_LD: t.ID_HeSo_LD ? parseInt(t.ID_HeSo_LD) : null,
                        MaHTDay: t.MaHTDay ? parseInt(t.MaHTDay) : null,
                        BieuThuc_JSON: validExpressions.length > 0 ? JSON.stringify(validExpressions) : null,
                        BieuThuc_Text: null,
                        TrangThai: true
                    };
                });

                const res = await fetch(`${apiBase}/truong-hop-cong-thuc/nhom-cong-thuc/${this.currentGroupId}/bulk-update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ truong_hop_cong_thuc: validTruongHop })
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => null);
                    const errMsg = errorData && errorData.detail ? errorData.detail : "Lỗi khi lưu Trường hợp công thức";
                    throw new Error(errMsg);
                }

                if (typeof showToast !== 'undefined') showToast("Đã lưu danh sách Trường hợp công thức thành công!");

                // Cập nhật lại ID từ server (nếu tạo mới)
                await this.loadDrawerData(this.currentGroupId);
                // Giữ nguyên tab đang chọn
                const newTh = this.truongHopData.find(x => x.MaHTDay === th.MaHTDay);
                if (newTh) this.activeMenuId = newTh.id;
                this.renderMenu();
                this.renderDetailView();
            }
        } catch (error) {
            console.error(error);
            if (typeof showToast !== 'undefined') showToast("Lỗi: " + error.message);
            else alert("Lỗi: " + error.message);
        } finally {
            btnSave.innerHTML = originalText;
            btnSave.disabled = false;
        }
    }
}

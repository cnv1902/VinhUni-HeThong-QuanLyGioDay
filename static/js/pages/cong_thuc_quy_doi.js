// ==========================================
// QUẢN LÝ CÔNG THỨC QUY ĐỔI (Page-Level JS)
// ==========================================
let myTable;
let formModal = null;
let tagHinhThucHoc = null;
let cbHeDaoTao = null;
let cbTuHocKy = null;
let cbDenHocKy = null;
let editingId = null; // null = Thêm mới, có giá trị = Sửa

// Format "1_2023-2024" => "Kỳ 1 (2023-2024)"
function formatHocKyName(rawName) {
  if (!rawName) return '';
  const cleanName = rawName.trim();
  const parts = cleanName.split('_');
  if (parts.length === 2) {
    return `Kỳ ${parts[0].trim()} (${parts[1].trim()})`;
  }
  return cleanName;
}

/**
 * Khởi tạo dữ liệu cốt lõi (Cấu hình cột) 1 lần duy nhất khi mở trang.
 * Không tải data bảng ngay lúc này, mà chờ Navbar báo cáo "ContextReady".
 */
async function init() {
  try {
    renderFooterUI();

    const rawColsConfig = await apiCongThuc.getColumnsConfig();
    const colsConfig = TableConfigModal.mergeConfig('table_CQ_CongThucQuyDoi_Config', rawColsConfig);

    // Khởi tạo DataTable Component
    myTable = new DataTable({
      tableId: 'dataTable',
      paginationId: 'tablePagination',
      pageSize: 100,
      isRowSelectable: () => true, 
      isRowEditable: () => false,   // Tạm thời chưa code sửa
      onSelectionChange: (selectedSet) => {
        updateFooter(myTable.getRows(), selectedSet);
      },
      onRenderComplete: (allRows, selectedSet) => {
        updateFooter(allRows, selectedSet);
      },
      customCellRender: (row, col) => {
        if (col.MaTruong === 'HanhDong') {
          return `
            <span data-action="config" data-id="${row.ID_Nhom_CT}" style="color: var(--text-secondary); cursor: pointer; margin-right: 12px; font-weight: 500;">Cấu hình</span>
            <span data-action="edit" data-id="${row.ID_Nhom_CT}" style="color: var(--brand-800); cursor: pointer; margin-right: 12px; font-weight: 500;">Sửa</span>
            <span data-action="delete" data-id="${row.ID_Nhom_CT}" style="color: var(--red-600); cursor: pointer; font-weight: 500;">Xóa</span>
          `;
        }
        return null; // Trả về null để datatable dùng render mặc định cho các cột khác
      }
    });

    myTable.setColumns(colsConfig, rawColsConfig);

    bindStaticEvents();
    
    // Khởi tạo Modal Tạo Nhóm
    initFormModal();
  } catch (error) {
    console.error("Lỗi khi tải cấu hình cột:", error);
    if (typeof showToast !== 'undefined') showToast("Không thể tải cấu hình bảng từ máy chủ!");
  }
}

/**
 * Khởi tạo Modal Tạo nhóm
 */
/**
 * Khởi tạo Modal Tạo nhóm
 */
async function initFormModal() {
  if (typeof BaseModal !== 'undefined') {
    formModal = new BaseModal('modalNhomCongThuc');
    
    // Lấy danh sách Học kỳ từ navbarState khi ContextReady (để tránh race condition)
    const setupHocKyCombos = () => {
      const listHocKy = typeof navbarState !== 'undefined' ? navbarState.hocKyList : [];
      const hocKyData = listHocKy.map(hk => ({ id: hk.MaHocKy, text: formatHocKyName(hk.TenHocKy) }));
      
      const currentNavHocKy = sessionStorage.getItem('CTX_HOC_KY_NAM_HOC');
      let defaultHocKyId = null;
      if (currentNavHocKy) {
        const match = listHocKy.find(hk => hk.TenHocKy === currentNavHocKy);
        if (match) defaultHocKyId = match.MaHocKy;
      }

      if (typeof ComboBox !== 'undefined') {
        if (!cbTuHocKy) {
          cbTuHocKy = new ComboBox('#tuHocKyContainer', {
            data: hocKyData,
            fieldName: 'TuMaHocKy',
            placeholder: 'Chọn Từ học kỳ...',
            defaultValue: defaultHocKyId
          });
        } else {
          cbTuHocKy.data = hocKyData;
          cbTuHocKy.setValue(defaultHocKyId);
        }

        if (!cbDenHocKy) {
          cbDenHocKy = new ComboBox('#denHocKyContainer', {
            data: hocKyData,
            fieldName: 'DenMaHocKy',
            placeholder: 'Chọn Đến học kỳ (Không bắt buộc)'
          });
        } else {
          cbDenHocKy.data = hocKyData;
        }
      }
    };

    if (typeof navbarState !== 'undefined' && navbarState.hocKyList && navbarState.hocKyList.length > 0) {
      setupHocKyCombos();
    } else {
      window.addEventListener('ContextReady', setupHocKyCombos);
    }

    // Tải danh sách Hệ đào tạo
    const listHe = await apiCongThuc.getHeDaoTao();
    const heData = listHe.map(he => ({ id: he.ID_He, text: he.Ten_He }));
    
    if (typeof ComboBox !== 'undefined') {
      cbHeDaoTao = new ComboBox('#heDaoTaoContainer', {
        data: heData,
        fieldName: 'ID_He',
        placeholder: 'Chọn Hệ đào tạo...'
      });
    }

    // Tải danh sách Hình thức học & Khởi tạo TagInput
    const listHinhThuc = await apiCongThuc.getHinhThucHoc();
    const tagData = listHinhThuc.map(h => ({ id: h.MaHTHoc, text: h.TenHTHoc }));
    
    if (typeof TagInput !== 'undefined') {
      tagHinhThucHoc = new TagInput('#dsHinhThucHocContainer', {
        data: tagData,
        fieldName: 'DsMaHTHoc',
        placeholder: 'Gõ để tìm Hình thức học...'
      });
      
      const formEl = document.getElementById('formNhomCongThuc');
      formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validation form
        if (!cbHeDaoTao.getValue() || tagHinhThucHoc.getValues().length === 0 || !cbTuHocKy.getValue()) {
          if (typeof showToast !== 'undefined') showToast("Vui lòng nhập đầy đủ các trường bắt buộc (*)", "error");
          return;
        }

        const formData = new FormData(formEl);
        const data = Object.fromEntries(formData.entries());
        
        // Chuẩn hóa data
        data.ID_He = parseInt(data.ID_He) || 0;
        data.TuMaHocKy = parseInt(data.TuMaHocKy) || 0;
        data.DenMaHocKy = data.DenMaHocKy ? parseInt(data.DenMaHocKy) : null;
        data.TrangThai = data.TrangThai === 'true';
        
        try {
          const btnSubmit = formEl.querySelector('button[type="submit"]');
          if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Đang lưu...';
          }

          // Gọi API
          if (editingId) {
            await apiCongThuc.updateNhomCongThuc(editingId, data);
            if (typeof showToast !== 'undefined') showToast("Cập nhật nhóm công thức thành công!", "success");
          } else {
            await apiCongThuc.createNhomCongThuc(data);
            if (typeof showToast !== 'undefined') showToast("Thêm mới nhóm công thức thành công!", "success");
          }
          
          formModal.close();
          formEl.reset();
          editingId = null;
          
          // Tải lại bảng theo học kỳ đang chọn trên navbar
          const currentCtx = sessionStorage.getItem('CTX_HOC_KY_NAM_HOC');
          if (currentCtx) {
            loadTableData(currentCtx);
          }
          
        } catch (error) {
          if (typeof showToast !== 'undefined') showToast(error.message || "Có lỗi xảy ra khi lưu!", "error");
        } finally {
          const btnSubmit = formEl.querySelector('button[type="submit"]');
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = 'Lưu thay đổi';
          }
        }
      });
    }
  }
}

/**
 * Hàm tải dữ liệu bảng lưới dựa trên chuỗi hockyNamhoc
 */
async function loadTableData(hockyNamhoc) {
  try {
    if (myTable) {
      myTable.tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px;">Đang tải dữ liệu...</td></tr>';
    }

    const data = await apiCongThuc.getCongThucData(hockyNamhoc);
    if (myTable) {
      myTable.setData(data);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu bảng:", error);
    if (typeof showToast !== 'undefined') showToast("Không thể tải dữ liệu Công thức quy đổi!");
    if (myTable) {
      myTable.tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px; color: var(--red-600);">Lỗi tải dữ liệu</td></tr>';
    }
  }
}

// Bắt sự kiện khi Navbar đã nạp xong Context (Lần đầu mở trang)
window.addEventListener('ContextReady', (e) => {
  const hockyNamhoc = e.detail;
  loadTableData(hockyNamhoc);
});

// Bắt sự kiện khi người dùng đổi Năm học/Học kỳ trên Navbar
window.addEventListener('ContextChanged', (e) => {
  const hockyNamhoc = e.detail;
  loadTableData(hockyNamhoc);
});

/**
 * Hàm phụ trợ cập nhật các con số Thống kê ở Footer
 */
function updateFooter(rows, selectedSet = null) {
  const selectedSize = selectedSet ? selectedSet.size : (myTable ? myTable.state.selected.size : 0);

  const totalRowsEl = document.getElementById('statTotal');
  if (totalRowsEl) totalRowsEl.textContent = myTable ? myTable.state.data.length : 0;

  const filteredEl = document.getElementById('statFiltered');
  if (filteredEl) filteredEl.textContent = rows.length;

  const selectedEl = document.getElementById('statSelected');
  if (selectedEl) selectedEl.textContent = selectedSize;
}

/**
 * Render cấu trúc Footer (chỉ chạy 1 lần lúc init)
 */
function renderFooterUI() {
  const f = document.querySelector('.app-footer');
  if (!f) return;
  f.innerHTML = `
    <div class="footer-left">
      <div class="stat-badge">Tổng: <strong id="statTotal">0</strong></div>
      <div class="stat-badge">Hiển thị: <strong id="statFiltered">0</strong></div>
      <div class="stat-badge">Đã chọn: <strong id="statSelected" style="color:var(--brand-800)">0</strong></div>
    </div>
    <div class="footer-right">
      <span style="color:var(--text-muted)">Hệ thống Quản lý Giờ dạy - Đại học Vinh</span>
    </div>
  `;
}

/**
 * Gán các sự kiện tĩnh (chỉ gán 1 lần)
 */
function bindStaticEvents() {
  // 1. Nút Cấu hình hiển thị
  const btnConfig = document.getElementById('btnConfigTable');
  if (btnConfig) {
    btnConfig.addEventListener('click', () => {
      TableConfigModal.open('table_CQ_CongThucQuyDoi_Config', myTable.state.rawColumns, (newCols) => {
        myTable.setColumns(newCols);
      });
    });
  }

  // 2. Ô tìm kiếm nhanh
  const qs = document.getElementById('quickSearch');
  if (qs) {
    qs.addEventListener('input', (e) => {
      myTable.setSearch(e.target.value);
    });
  }

  // 3. Nút Thêm mới
  const btnNew = document.getElementById('btnNewGrounp');
  if (btnNew) {
    btnNew.addEventListener('click', () => {
      if (formModal) {
        editingId = null; // Reset trạng thái về Thêm mới
        document.getElementById('modalNhomCongThuc').querySelector('.modal-title').textContent = 'Thêm Nhóm Công Thức';
        
        // Xóa form cũ nếu cần
        document.getElementById('formNhomCongThuc').reset();
        if (tagHinhThucHoc) tagHinhThucHoc.clear();
        if (cbHeDaoTao) cbHeDaoTao.clear();
        if (cbDenHocKy) cbDenHocKy.clear();
        if (cbTuHocKy) {
          const currentNavHocKy = sessionStorage.getItem('CTX_HOC_KY_NAM_HOC');
          let defId = null;
          if (currentNavHocKy && cbTuHocKy.data) {
            const formatted = formatHocKyName(currentNavHocKy);
            const match = cbTuHocKy.data.find(d => d.text === formatted);
            if (match) defId = match.id;
          }
          if (defId) {
            cbTuHocKy.setValue(defId);
          } else {
            cbTuHocKy.clear();
          }
        }
        formModal.open();
      }
    });
  }

  // 4. Bắt sự kiện Click trên Bảng (Event Delegation cho các nút Hành động)
  if (myTable && myTable.tbody) {
    myTable.tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      
      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id);
      if (!id || isNaN(id)) return;

      const rowData = myTable.state.data.find(r => r.ID_Nhom_CT === id);
      if (!rowData) return;

      if (action === 'edit') {
        editingId = id;
        document.getElementById('modalNhomCongThuc').querySelector('.modal-title').textContent = 'Sửa Nhóm Công Thức';
        
        const formEl = document.getElementById('formNhomCongThuc');
        formEl.reset();
        
        // Đổ dữ liệu vào các ô input cơ bản
        const inputTen = formEl.querySelector('[name="TenNhomCongThuc"]');
        if (inputTen) inputTen.value = rowData.TenNhomCongThuc || '';
        
        const inputGhiChu = formEl.querySelector('[name="GhiChu_DieuKien"]');
        if (inputGhiChu) inputGhiChu.value = rowData.GhiChu_DieuKien || '';
        
        const inputTrangThai = formEl.querySelector('[name="TrangThai"]');
        if (inputTrangThai) inputTrangThai.checked = !!rowData.TrangThai;
        
        // Đổ dữ liệu vào các component phức tạp
        if (cbHeDaoTao) cbHeDaoTao.setValue(rowData.ID_He);
        if (cbTuHocKy) cbTuHocKy.setValue(rowData.TuMaHocKy);
        if (cbDenHocKy) cbDenHocKy.setValue(rowData.DenMaHocKy);
        
        if (tagHinhThucHoc) {
          tagHinhThucHoc.clear();
          const dsIds = (rowData.DsMaHTHoc || '').split(',').filter(x => x);
          const dsNames = (rowData.Ds_TenHTHoc || '').split(',').map(x => x.trim());
          dsIds.forEach((hId, index) => {
            if (hId) tagHinhThucHoc.addTag(hId, dsNames[index] || hId);
          });
        }
        
        formModal.open();
      } 
      else if (action === 'delete') {
        if (typeof confirmModal !== 'undefined') {
          const isOk = await confirmModal.show(
            `Bạn có chắc chắn muốn xóa Nhóm công thức <strong>${rowData.TenNhomCongThuc || ''}</strong> không? Hành động này không thể hoàn tác!`,
            'Xác nhận Xóa',
            'Xóa Nhóm',
            'var(--red-600)'
          );
          
          if (isOk) {
            try {
              await apiCongThuc.deleteNhomCongThuc(id);
              if (typeof showToast !== 'undefined') showToast("Đã xóa nhóm công thức thành công!", "success");
              // Reload table
              const currentCtx = sessionStorage.getItem('CTX_HOC_KY_NAM_HOC');
              if (currentCtx) loadTableData(currentCtx);
            } catch (err) {
              if (typeof showToast !== 'undefined') showToast(err.message || "Lỗi khi xóa nhóm công thức", "error");
            }
          }
        }
      }
      else if (action === 'config') {
        if (typeof showToast !== 'undefined') showToast("Tính năng cấu hình đang được phát triển!", "info");
      }
    });
  }
}

// Khởi động
init();

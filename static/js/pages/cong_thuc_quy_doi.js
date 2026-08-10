// ==========================================
// QUẢN LÝ CÔNG THỨC QUY ĐỔI (Page-Level JS)
// ==========================================
let myTable;

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
      }
    });

    myTable.setColumns(colsConfig, rawColsConfig);

    bindStaticEvents();
  } catch (error) {
    console.error("Lỗi khi tải cấu hình cột:", error);
    if (typeof showToast !== 'undefined') showToast("Không thể tải cấu hình bảng từ máy chủ!");
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
}

// Khởi động
init();

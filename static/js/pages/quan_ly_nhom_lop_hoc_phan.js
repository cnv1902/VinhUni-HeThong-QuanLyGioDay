// ==========================================
// QUẢN LÝ NHÓM LỚP HỌC PHẦN (Page-Level JS)
// ==========================================
let myTable;

/**
 * Khởi tạo dữ liệu cốt lõi (Cấu hình cột) 1 lần duy nhất khi mở trang.
 * Không tải data bảng ngay lúc này, mà chờ Navbar báo cáo "ContextReady".
 */
async function init() {
  try {
    const rawColsConfig = await apiLopHocPhan.getColumnsConfig();
    const colsConfig = TableConfigModal.mergeConfig('table_CQ_NhomLopHocPhan_Config', rawColsConfig);

    // Khởi tạo DataTable Component
    myTable = new DataTable({
      tableId: 'dataTable',
      paginationId: 'tablePagination',
      pageSize: 100,
      onRowDirty: (row, key, val) => {
        // Có thể gọi API để auto-save nếu muốn
      },
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
    if(typeof showToast !== 'undefined') showToast("Không thể tải cấu hình bảng từ máy chủ!");
  }
}

/**
 * Hàm tải dữ liệu bảng lưới dựa trên MaHocKy
 */
async function loadTableData(maHocKy) {
  try {
    if(myTable) {
        myTable.tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px;">Đang tải dữ liệu...</td></tr>';
    }
    
    const nhomLopData = await apiLopHocPhan.getNhomLopData(maHocKy);
    if(myTable) {
        myTable.setData(nhomLopData);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu bảng:", error);
    if(typeof showToast !== 'undefined') showToast("Không thể tải dữ liệu Lớp học phần!");
    if(myTable) {
        myTable.tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px; color: var(--red-600);">Lỗi tải dữ liệu</td></tr>';
    }
  }
}

// Bắt sự kiện khi Navbar đã nạp xong Context (Lần đầu mở trang)
window.addEventListener('ContextReady', (e) => {
  const maHocKy = e.detail;
  loadTableData(maHocKy);
});

// Bắt sự kiện khi người dùng đổi Năm học/Học kỳ trên Navbar
window.addEventListener('ContextChanged', (e) => {
  const maHocKy = e.detail;
  loadTableData(maHocKy);
});

/**
 * Hàm phụ trợ cập nhật các con số Thống kê ở Footer
 * @param {Array} rows - Các dòng dữ liệu đang được hiển thị
 * @param {Set} selectedSet - Tập hợp ID các dòng đang được chọn
 */
function updateFooter(rows, selectedSet = null) {
  const selectedSize = selectedSet ? selectedSet.size : (myTable ? myTable.state.selected.size : 0);
  
  const totalRowsEl = document.getElementById('statTotal');
  if (totalRowsEl) totalRowsEl.textContent = myTable ? myTable.state.data.length : 0;
  
  const filteredEl = document.getElementById('statFiltered');
  if (filteredEl) filteredEl.textContent = rows.length;

  const selSpan = document.getElementById('statSelected');
  if (selSpan) {
    selSpan.textContent = selectedSize;
  }
  
  // Tính tổng sinh viên, tổng tín chỉ
  let sumSv = 0;
  let sumTc = 0;
  rows.forEach(r => {
    sumSv += (r.SoSinhVien || 0);
    sumTc += (r.SoTinChi || 0);
  });
  
  const sumSvEl = document.getElementById('statSV');
  if (sumSvEl) sumSvEl.textContent = formatNum(sumSv);
  
  const sumTcEl = document.getElementById('statTC');
  if (sumTcEl) sumTcEl.textContent = formatNum(sumTc);
}

function formatNum(num) {
    return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Trạm điều hướng các sự kiện tĩnh, được gắn vào các Control riêng biệt nằm BÊN NGOÀI bảng
 */
function bindStaticEvents() {
  // Tìm kiếm nhanh
  const quickSearch = document.getElementById('quickSearch');
  if (quickSearch) {
    quickSearch.addEventListener('input', e => {
      myTable.setSearch(e.target.value);
    });
  }



  // Sự kiện cấu hình hiển thị bảng
  const btnConfigTable = document.getElementById('btnConfigTable');
  if (btnConfigTable && typeof TableConfigModal !== 'undefined') {
    btnConfigTable.addEventListener('click', () => {
      TableConfigModal.open('table_CQ_NhomLopHocPhan_Config', myTable.state.rawColumns, (newCols) => {
        myTable.setColumns(newCols);
      });
    });
  }
}

// Chạy hàm khởi tạo trang
init();

// static/js/components/tableConfig.js

/**
 * Quản lý logic của Modal Cấu hình hiển thị bảng.
 */
const TableConfigModal = (function() {
  let modalOverlay, tbody, btnClose, btnCancel, btnSave, btnReset, btnAutoFit;
  let currentConfigKey = '';
  let editingColumns = [];
  let onSaveCallback = null;

  function init() {
    modalOverlay = document.getElementById('tableConfigModalOverlay');
    if (!modalOverlay) return;

    tbody = document.getElementById('tableConfigBody');
    btnClose = document.getElementById('btnConfigClose');
    btnCancel = document.getElementById('btnConfigCancel');
    btnSave = document.getElementById('btnConfigSave');
    btnReset = document.getElementById('btnConfigReset');
    btnAutoFit = document.getElementById('btnConfigAutoFit');

    btnClose.addEventListener('click', close);
    btnCancel.addEventListener('click', close);
    btnSave.addEventListener('click', saveConfig);
    btnReset.addEventListener('click', resetConfig);
    if (btnAutoFit) btnAutoFit.addEventListener('click', autoFitColumns);

    // Xử lý sự kiện Event Delegation cho nút lên/xuống và các input
    tbody.addEventListener('click', handleTbodyClick);
    tbody.addEventListener('change', handleTbodyChange);
  }

  function open(storageKey, originalColumns, callback) {
    if (!modalOverlay) return;
    currentConfigKey = storageKey;
    onSaveCallback = callback;

    // Trộn cấu hình gốc với localStorage
    editingColumns = mergeConfig(storageKey, originalColumns);
    
    // Đảm bảo thứ tự hiển thị luôn liên tục và đúng
    editingColumns.sort((a, b) => a.ThuTuHienThi - b.ThuTuHienThi);
    editingColumns.forEach((col, idx) => col.ThuTuHienThi = idx + 1);

    renderTable();
    modalOverlay.style.display = 'flex';
  }

  function close() {
    modalOverlay.style.display = 'none';
  }

  function renderTable() {
    tbody.innerHTML = editingColumns.map((col, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === editingColumns.length - 1;
      
      return `
        <tr data-index="${idx}">
          <td style="text-align: center;">${idx + 1}</td>
          <td>
            <input type="text" class="config-tentruong text-input" value="${col.TenTruong || col.MaTruong}" style="width: 100%;">
          </td>
          <td style="text-align: center;">
            <input type="checkbox" class="config-hienthi" ${col.HienThi ? 'checked' : ''}>
          </td>
          <td>
            <select class="config-canle">
              <option value="left" ${(!col.CanLe || col.CanLe === 'left') ? 'selected' : ''}>Mặc định (Trái)</option>
              <option value="center" ${col.CanLe === 'center' ? 'selected' : ''}>Giữa</option>
              <option value="right" ${col.CanLe === 'right' ? 'selected' : ''}>Phải</option>
            </select>
          </td>
          <td>
            <input type="number" class="config-dorong text-input" value="${col.DoRong || 100}" style="width: 100%; text-align: right;">
          </td>
          <td style="text-align: center;">
            <div class="order-controls">
              <button class="mini-btn btn-up" title="Lên" ${isFirst ? 'disabled' : ''}>▲</button>
              <button class="mini-btn btn-down" title="Xuống" ${isLast ? 'disabled' : ''}>▼</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function handleTbodyClick(e) {
    const btnUp = e.target.closest('.btn-up');
    const btnDown = e.target.closest('.btn-down');
    if (!btnUp && !btnDown) return;
    
    // PHẢI sync dữ liệu từ DOM vào mảng TRƯỚC KHI hoán đổi vị trí
    syncFormDataToState();

    const tr = e.target.closest('tr');
    const idx = parseInt(tr.dataset.index);

    if (btnUp && idx > 0) {
      // Hoán đổi vị trí
      const temp = editingColumns[idx - 1];
      editingColumns[idx - 1] = editingColumns[idx];
      editingColumns[idx] = temp;
    } else if (btnDown && idx < editingColumns.length - 1) {
      const temp = editingColumns[idx + 1];
      editingColumns[idx + 1] = editingColumns[idx];
      editingColumns[idx] = temp;
    }
    
    // Cập nhật lại ThuTuHienThi
    editingColumns.forEach((col, i) => col.ThuTuHienThi = i + 1);
    
    // Render lại giao diện
    renderTable();
  }

  function handleTbodyChange(e) {
    // Chỉ cập nhật giá trị nếu cần thiết
    syncFormDataToState();
  }

  function syncFormDataToState() {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      const idx = parseInt(row.dataset.index);
      const chk = row.querySelector('.config-hienthi');
      const sel = row.querySelector('.config-canle');
      const num = row.querySelector('.config-dorong');
      const txt = row.querySelector('.config-tentruong');
      
      editingColumns[idx].HienThi = chk.checked;
      editingColumns[idx].CanLe = sel.value;
      editingColumns[idx].DoRong = parseInt(num.value) || 100;
      if (txt) editingColumns[idx].TenTruong = txt.value;
    });
  }

  function saveConfig() {
    syncFormDataToState();
    
    // Trích xuất những trường cần lưu
    const savedData = editingColumns.map(col => ({
      MaTruong: col.MaTruong,
      TenTruong: col.TenTruong,
      HienThi: col.HienThi,
      CanLe: col.CanLe,
      DoRong: col.DoRong,
      ThuTuHienThi: col.ThuTuHienThi
    }));

    localStorage.setItem(currentConfigKey, JSON.stringify(savedData));
    
    if (typeof showToast === 'function') {
      showToast('Đã lưu cấu hình bảng thành công!', 'success');
    }
    
    close();
    
    if (onSaveCallback) {
      onSaveCallback(editingColumns);
    }
  }

  function resetConfig() {
    localStorage.removeItem(currentConfigKey);
    if (typeof showToast === 'function') {
      showToast('Đã khôi phục cấu hình mặc định!', 'success');
    }
    close();
    // Báo reload lại page để gọi lại API nguyên bản
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  /**
   * Tính toán chiều rộng văn bản sử dụng Canvas API
   */
  function calculateTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font || "13px 'IBM Plex Sans', sans-serif";
    return Math.ceil(context.measureText(text).width);
  }

  /**
   * Tự động căn chỉnh chiều rộng cột dựa theo độ dài nội dung của Tên cột
   */
  function autoFitColumns() {
    syncFormDataToState();
    
    // Khoảng trống (padding) bổ sung:
    // 32px (padding trái phải 16px) + 40px (icon sort & filter) + 10px (buffer)
    const extraPadding = 82; 
    
    editingColumns.forEach((col, idx) => {
      const textToMeasure = col.TenTruong || col.MaTruong || "";
      const textWidth = calculateTextWidth(textToMeasure);
      const calculatedWidth = textWidth + extraPadding;
      
      // Giới hạn chiều rộng tối thiểu 80px để không quá bé
      col.DoRong = Math.max(80, calculatedWidth);
    });
    
    renderTable();
    if (typeof showToast === 'function') {
      showToast('Đã tính toán chiều rộng tối ưu cho các cột!', 'success');
    }
  }

  /**
   * Trộn cấu hình gốc từ API với cấu hình lưu trong localStorage.
   */
  function mergeConfig(storageKey, apiColumns) {
    const savedStr = localStorage.getItem(storageKey);
    // Deep clone apiColumns
    let merged = JSON.parse(JSON.stringify(apiColumns));

    if (savedStr) {
      try {
        const savedArr = JSON.parse(savedStr);
        // Map lại dữ liệu
        const savedMap = {};
        savedArr.forEach(c => savedMap[c.MaTruong] = c);

        merged.forEach(col => {
          const sCol = savedMap[col.MaTruong];
          if (sCol) {
            col.HienThi = sCol.HienThi;
            col.CanLe = sCol.CanLe;
            col.DoRong = sCol.DoRong;
            col.ThuTuHienThi = sCol.ThuTuHienThi;
            if (sCol.TenTruong) {
                col.TenTruong = sCol.TenTruong;
            }
          }
        });
      } catch (e) {
        console.error('Lỗi khi đọc cấu hình localStorage', e);
      }
    }
    
    return merged.sort((a, b) => a.ThuTuHienThi - b.ThuTuHienThi);
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    open,
    mergeConfig
  };
})();

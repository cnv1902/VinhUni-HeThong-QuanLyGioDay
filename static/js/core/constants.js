const KHOA_LIST = ['Công nghệ thông tin', 'Kinh tế', 'Sư phạm Toán học', 'Ngoại ngữ', 'Xây dựng', 'Nông Lâm Ngư nghiệp', 'Luật', 'Giáo dục thể chất - QP'];
    const KHOA_CN_MAP = { 'Công nghệ thông tin': 'CNTT', 'Kinh tế': 'KT', 'Sư phạm Toán học': 'SP Toán', 'Ngoại ngữ': 'NN-Anh', 'Xây dựng': 'XD', 'Nông Lâm Ngư nghiệp': 'NLN', 'Luật': 'Luật', 'Giáo dục thể chất - QP': 'GDTC' };
    const KHOA_CN_LIST = Object.values(KHOA_CN_MAP);
    const HT_HOC_LIST = ['Lý thuyết', 'Thực hành', 'LT+TH'];
    const HT_CHITIET_LIST = ['Trực tiếp', 'Trực tuyến', 'Kết hợp'];
    const TC_LOP_LIST = ['Niên chế', 'Tín chỉ'];
    const TT_LIST = ['Chưa xác nhận', 'Đã xác nhận', 'Đã thanh toán'];
    const HK_LIST = ['1_2025-2026', '2_2025-2026'];

    const COLUMNS = [
      { key: 'stt', label: 'TT', type: 'number', width: 46, editable: false, sortable: true, filterable: false, sticky: true },
      { key: 'tenNhom', label: 'Tên nhóm lớp học phần', type: 'text', width: 260, editable: true, sortable: true, filterable: true, sticky: true },
      { key: 'soSV', label: 'Số SV', type: 'number', width: 70, editable: true, sortable: true, filterable: true },
      { key: 'hocKy', label: 'Học kỳ', type: 'select', options: HK_LIST, width: 110, editable: true, sortable: true, filterable: true },
      { key: 'khoa', label: 'Khoa', type: 'select', options: KHOA_LIST, width: 170, editable: true, sortable: true, filterable: true },
      { key: 'soPhong', label: 'Số phòng', type: 'text', width: 90, editable: true, sortable: true, filterable: true },
      { key: 'hinhThucHoc', label: 'HT học', type: 'select', options: HT_HOC_LIST, width: 100, editable: true, sortable: true, filterable: true },
      { key: 'hinhThucHocChiTiet', label: 'HT học chi tiết', type: 'select', options: HT_CHITIET_LIST, width: 140, editable: true, sortable: true, filterable: true },
      { key: 'cachTCLop', label: 'Cách TC lớp', type: 'select', options: TC_LOP_LIST, width: 110, editable: true, sortable: true, filterable: true },
      { key: 'chuyen', label: 'Chuyên', type: 'text', width: 90, editable: true, sortable: true, filterable: true },
      { key: 'soTC', label: 'Số TC', type: 'number', width: 70, editable: true, sortable: true, filterable: true },
      { key: 'lt', label: 'LT', type: 'number', width: 55, editable: true, sortable: true, filterable: true },
      { key: 'th', label: 'TH', type: 'number', width: 55, editable: true, sortable: true, filterable: true },
      { key: 'tl', label: 'TL', type: 'number', width: 55, editable: true, sortable: true, filterable: true },
      { key: 'da', label: 'ĐA', type: 'number', width: 55, editable: true, sortable: true, filterable: true },
      { key: 'trangThai', label: 'Trạng thái', type: 'badge', options: TT_LIST, width: 130, editable: true, sortable: true, filterable: true },
      { key: 'dakl', label: 'ĐAKL', type: 'number', width: 65, editable: true, sortable: true, filterable: true },
      { key: 'qdlt', label: 'QĐLT', type: 'number', width: 65, editable: true, sortable: true, filterable: true },
      { key: 'qdth', label: 'QĐTH', type: 'number', width: 65, editable: true, sortable: true, filterable: true },
      { key: 'qdtl', label: 'QĐTL', type: 'number', width: 65, editable: true, sortable: true, filterable: true },
      { key: 'siSoDKH', label: 'Sĩ số ĐKH', type: 'capacity', width: 120, editable: true, sortable: true, filterable: true },
      { key: 'siSoBS', label: 'Sĩ số BS', type: 'number', width: 85, editable: true, sortable: true, filterable: true },
      { key: 'khoaCN', label: 'Khoa CN', type: 'select', options: KHOA_CN_LIST, width: 110, editable: true, sortable: true, filterable: true },
      { key: 'fileId', label: 'File_ID', type: 'mono', width: 110, editable: false, sortable: true, filterable: true },
      { key: 'tongHop', label: 'Tổng hợp lại', type: 'action', width: 110, editable: false, sortable: false, filterable: false },
      { key: 'heSoHP', label: 'Hệ số HP', type: 'number', width: 90, editable: true, sortable: true, filterable: true }
    ];

    const stickyOffsets = {};
    (function () { let cum = 40; COLUMNS.forEach(c => { if (c.sticky) { stickyOffsets[c.key] = cum; cum += c.width; } }); })();

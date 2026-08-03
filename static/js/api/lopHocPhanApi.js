function generateData() {
      const SUBJECTS = {
        'Công nghệ thông tin': ['Lập trình hướng đối tượng', 'Cấu trúc dữ liệu và giải thuật', 'Cơ sở dữ liệu', 'Mạng máy tính', 'Trí tuệ nhân tạo', 'Lập trình Web'],
        'Kinh tế': ['Kinh tế vi mô', 'Kinh tế vĩ mô', 'Nguyên lý kế toán', 'Quản trị học', 'Marketing căn bản', 'Tài chính doanh nghiệp'],
        'Sư phạm Toán học': ['Giải tích 1', 'Đại số tuyến tính', 'Xác suất thống kê', 'Phương pháp dạy học Toán', 'Hình học sơ cấp'],
        'Ngoại ngữ': ['Anh văn 1', 'Anh văn 2', 'Ngữ âm - Âm vị học', 'Biên dịch', 'Kỹ năng nghe nói'],
        'Xây dựng': ['Sức bền vật liệu', 'Bê tông cốt thép 1', 'Kết cấu thép', 'Trắc địa', 'Nền và móng'],
        'Nông Lâm Ngư nghiệp': ['Chăn nuôi đại cương', 'Trồng trọt đại cương', 'Khoa học đất', 'Nuôi trồng thủy sản'],
        'Luật': ['Luật dân sự', 'Luật hình sự', 'Luật hành chính', 'Luật lao động'],
        'Giáo dục thể chất - QP': ['Giáo dục thể chất 1', 'Giáo dục thể chất 2', 'Giáo dục quốc phòng 1']
      };
      const COHORTS = ['K63A', 'K63B', 'K64A', 'K64B', 'K65A'];
      const rows = []; let stt = 1, fileSeq = 1;
      KHOA_LIST.forEach(khoa => {
        SUBJECTS[khoa].forEach((subject, si) => {
          const groupsCount = si % 3 === 0 ? 2 : 1;
          for (let g = 1; g <= groupsCount; g++) {
            const soTC = 2 + (stt % 3);
            const lt = soTC * 15;
            const th = (stt % 4 === 0) ? soTC * 10 : 0;
            const tl = (stt % 5 === 0) ? 10 : 0;
            const da = (stt % 7 === 0) ? 15 : 0;
            const soSV = 45 + (stt * 7) % 50;
            const dkhDelta = ((stt * 13) % 20) - 8;
            const siSoDKH = Math.max(10, soSV + dkhDelta);
            const siSoBS = (stt * 3) % 6;
            const hinhThucHoc = th > 0 ? (lt > 0 ? 'LT+TH' : 'Thực hành') : 'Lý thuyết';
            rows.push({
              id: 'r' + stt, stt: stt,
              tenNhom: `${subject}_N0${g}`,
              soSV, hocKy: stt % 9 === 0 ? HK_LIST[1] : HK_LIST[0],
              khoa, soPhong: `${['A', 'B', 'C', 'D'][stt % 4]}${1 + (stt % 3)}-${100 + (stt * 3) % 20}`,
              hinhThucHoc, hinhThucHocChiTiet: HT_CHITIET_LIST[stt % HT_CHITIET_LIST.length],
              cachTCLop: TC_LOP_LIST[stt % 2], chuyen: COHORTS[stt % COHORTS.length],
              soTC, lt, th, tl, da,
              trangThai: stt % 9 === 0 ? TT_LIST[2] : (stt % 3 === 0 ? TT_LIST[1] : TT_LIST[0]),
              dakl: (stt % 11 === 0) ? 1 : 0, qdlt: Math.round(lt * 1.2), qdth: Math.round(th * 0.9), qdtl: tl ? Math.round(tl * 1.1) : 0,
              siSoDKH, siSoBS,
              khoaCN: KHOA_CN_MAP[khoa],
              fileId: `FHP-2026-${String(fileSeq).padStart(4, '0')}`,
              heSoHP: [1.0, 1.2, 1.5][stt % 3],
              _dirty: false
            });
            stt++; fileSeq++;
          }
        });
      });
      return rows;
    }

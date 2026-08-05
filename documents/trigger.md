USE [qlGioDay]
GO
/****** Object:  Trigger [dbo].[QuyDoiGio_Update]    Script Date: 04/08/2026 8:19:31 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[QuyDoiGio_Update]
   ON  [dbo].[tbl_CQ_NhomLopHocPhan]
   AFTER  UPDATE
AS 
BEGIN
	Declare @SoSinhVien int
	Declare @SoPhong int
	Declare @HinhThucHoc int
	Declare @HinhThucDay int
	Declare @LopChuyen bit
	Declare @KhoaCN nvarchar(100)
	Declare @KhoaHoc nvarchar(100)
	Declare @SoTietLT float
	Declare @SoTietTH float
	Declare @SoTietBT float
	Declare @SoTietDA float
	Declare @SoTietThucTap float
	Declare @SoTietDoAnKhoaLuan float
	Declare @SoTietLTQD float
	Declare @SoTietTHQD float
	Declare @SoTietBTQD float
	Declare @HeSoNhanLT float
	Declare @HeSoNhanTH float
	Declare @HeSoNhanBT float
	Declare @SoTinChi float
	Declare @GioDay1TC_GDTC float
	Declare @HS_ID bigint
	Declare @SiSoChuyenDoi int
	Declare @SiSoDKH int
	Declare @MaHocKy int
	Declare @HeSoHocPhi float
	
---- Thiết lập giá trị
	Set @SoSinhVien = (SELECT top 1 SoSinhVien FROM INSERTED)
	Set @SiSoChuyenDoi = (SELECT top 1 SiSoChuyenDoi FROM INSERTED)
	Set @SiSoDKH = (SELECT top 1 SiSoDKH FROM INSERTED)
	Set @SoPhong =(SELECT top 1 SoPhong FROM INSERTED)
	Set @HinhThucHoc =(SELECT top 1 MaHTHoc FROM INSERTED)
	Set @HinhThucDay =(SELECT  top 1  MaHTDay FROM INSERTED)
	Set @LopChuyen =(SELECT top 1  LopChuyen FROM INSERTED)
	Set @KhoaCN =(SELECT top 1  KhoaCN FROM INSERTED)
	Set @SoTietLT =(SELECT top 1  SoTietLT FROM INSERTED)
	Set @SoTietTH =(SELECT top 1  SoTietTH FROM INSERTED)
	Set @SoTietBT =(SELECT top 1  SoTietBT FROM INSERTED)
	Set @SoTietDA =(SELECT top 1  SoTietDA FROM INSERTED)
	Set @SoTietThucTap =(SELECT top 1  SoTietThucTap FROM INSERTED)
	Set @SoTietDoAnKhoaLuan =(SELECT top 1  SoTietDoAnKhoaLuan FROM INSERTED)
	Set @SoTinChi =(SELECT top 1  SoTinChi FROM INSERTED)
	Set @SoTietLTQD =(SELECT top 1  SoTietLTQD FROM INSERTED)
	Set @SoTietTHQD =(SELECT top 1  SoTietTHQD FROM INSERTED)
	Set @SoTietBTQD =(SELECT top 1  SoTietBTQD FROM INSERTED)
	Set @MaHocKy =(SELECT top 1  MaHocKy FROM INSERTED)
	Set @HeSoHocPhi =(SELECT top 1  HeSoHocDi FROM INSERTED)
	Set @KhoaHoc =(SELECT top 1  KhoaHoc FROM INSERTED)
	Set @HeSoNhanLT =1.0
	Set @HeSoNhanTH =1.0
	Set @HeSoNhanBT =1.0
	Set @GioDay1TC_GDTC =0

	if (@SiSoChuyenDoi IS NULL)
		SET @SiSoChuyenDoi =0	
	

	--IF  EXISTS(SELECT ID FROM INSERTED WHERE ID_LanTongHopFile <=1)
	--	UPDATE tbl_CQ_NhomLopHocPhan SET SoSinhVien = @SiSoDKH + @SiSoChuyenDoi, [TenNhomLopHP_KhongDau] =dbo.f_nosymbol([TenNhomLopHP]) WHERE MaNhomLopHP = (SELECT TOP 1 INSERTED.MaNhomLopHP FROM INSERTED)
	
--===========================================================================================================================================================================
	-- KIỂM TRA ĐẢM BẢO BẢN GHI NÀY CHƯA ĐƯỢC TỔNG HỢP CẬP NHẬT LẠI SỐ SINH VIÊN BẰNG SỐ SVDK + SỐ SVCD
--===========================================================================================================================================================================
	IF  EXISTS(SELECT ID FROM INSERTED WHERE ID_LanTongHopFile <=1)
		UPDATE tbl_CQ_NhomLopHocPhan SET SoSinhVien = @SiSoDKH + @SiSoChuyenDoi WHERE MaNhomLopHP = (SELECT TOP 1 INSERTED.MaNhomLopHP FROM INSERTED)

--===========================================================================================================================================================================
	-- GÁN BIẾN SỐ SINH VIÊN VÀ KIỂM TRA BẢN GHI KHÔNG CẬP NHẬT ID_LANTONGHOPFILE
--===========================================================================================================================================================================

	Set @SoSinhVien = (SELECT top 1 SoSinhVien FROM INSERTED)
If NOT(UPDATE(ID_LanTongHopFile))  --AND EXISTS(SELECT ID FROM INSERTED WHERE ID_LanTongHopFile <=1)
	BEGIN
	
		-- Nếu học phần đã được xác nhận và tổng hợp biểu không thay đổi dữ liệu được
			--IF EXISTS(SELECT ID FROM INSERTED WHERE ID_LanTongHopFile > 1)
			--	ROLLBACK;
		
--===========================================================================================================================================================================
	-- NẾU HỌC PHẦN ĐÃ ĐƯỢC XÁC NHẬN THANH TOÁN THÌ KHÔNG THAY ĐỔI
--===========================================================================================================================================================================

		-- Nếu học phần đã được xác nhận và thanh toán thì không thay đổi được
			IF EXISTS(SELECT MaNhomLopHP FROM tbl_CQ_KeKhai WHERE MaNhomLopHP IN (SELECT MaNhomLopHP FROM INSERTED) AND (XacNhanThanhToan=1))
				ROLLBACK;
			
		  IF (@MaHocKy <26)
				BEGIN
				--THEO QUY CHẾ CHI TIÊU NỘI BỘ NĂM 2017 (áp dụng từ năm học 2016-2017), Từ học kỳ 1-2023-2024 trở về trước
				-- Xác định hệ số nhân lý thuyết và tính giờ cho các hình thức học: Lý thuyết, Lý thuyết & Thảo luận, Lý thuyết & Bài tập,Lý thuyết & Thực hành

				if (UPDATE(SoSinhVien) OR UPDATE(MaHTHoc) OR UPDATE(MaHTDay) OR UPDATE(SoTinChi) OR UPDATE(SoTietLT) OR UPDATE(SoTietTH) OR UPDATE(SoTietBT) OR UPDATE(SoTietDA) OR UPDATE(SoTietThucTap) OR UPDATE(SoTietDoAnKhoaLuan))
					BEGIN
					if (@HinhThucHoc=1 or @HinhThucHoc=12 or @HinhThucHoc=13 or @HinhThucHoc=14 or @HinhThucHoc=18 )
						begin
						-- Dạy online
							if (@HinhThucDay=2)
								begin
									if (@SoPhong>=4)
										set @HeSoNhanLT=3.0
									else
										if (@SoPhong>=3)
											set @HeSoNhanLT=2.0
										ELSE
											if (@SoPhong>=2)
												SET @HeSoNhanLT= 1.5
											ELSE 
												SET @HeSoNhanLT= 1.0
								end

						-- Dạy bằng Tiếng Anh thi bằng Tiếng Việt
							if (@HinhThucDay=10)
								begin
									if (@SoSinhVien>=120) 	
										set @HeSoNhanLT= 1.5*1.5
									else 
										if (@SoSinhVien>=70) 	
											set @HeSoNhanLT=1.5*1.3
										else
										   if (@SoSinhVien>=10) 	
	 											SET @HeSoNhanLT=1.5*1.0	
											ELSE 								
												SET @HeSoNhanLT= 1.5*@SoSinhVien*0.1;	
								end

							-- Dạy bằng Tiếng Anh thi bằng Tiếng Anh
							if (@HinhThucDay=11)
								begin
									if (@SoSinhVien>=120) 	
										set @HeSoNhanLT= 2.0*1.5
									else 
										if (@SoSinhVien>=70) 	
											set @HeSoNhanLT=2.0*1.3
										else
										   if (@SoSinhVien>=10) 	
	 											SET @HeSoNhanLT=2.0*1.0	
											ELSE 								
												SET @HeSoNhanLT= 2.0*@SoSinhVien*0.1;	

								end
			
							-- Dạy bình thường - quy đổi lớp đông
							if (@HinhThucDay=1)
								begin
									if (@SoSinhVien>=120) 	
										set @HeSoNhanLT= 1.5
									else 
										if (@SoSinhVien>=70) 	
											set @HeSoNhanLT=1.3
										ELSE
										   if (@SoSinhVien>=10) 	
	 											SET @HeSoNhanLT=1.0		
											ELSE 								
												SET @HeSoNhanLT= @SoSinhVien*0.1;		

								end

							-- Dạy ngoại ngữ
							if (@HinhThucDay=3)
								begin
									if (@LopChuyen=0)
										begin
											if (@SoSinhVien>60)
												set @HeSoNhanLT=1.3
											else
if (@SoSinhVien>=10) 	
	 												SET @HeSoNhanLT=1.0		
												ELSE 								
													SET @HeSoNhanLT= @SoSinhVien*0.1;			

										end						
								end
			
						-- Dạy Môn chuyên ngành
							if (@HinhThucDay=13)
								begin
									if (@SoSinhVien>=120) 	
										set @HeSoNhanLT= 1.5
									else 
										if (@SoSinhVien>=70) 	
											set @HeSoNhanLT=1.3
										ELSE
										   if (@SoSinhVien>=10) 	
	 											SET @HeSoNhanLT=1.0		
											ELSE 								
												SET @HeSoNhanLT= @SoSinhVien*0.1;			
								END
                
		
		

						-- Cập nhật số tiết lý thuyết quy đổi (Lý thuyết + Thảo luận (Bài tập)
							if (@HinhThucHoc=12 or @HinhThucHoc=13) 
								begin
									set @SoTietLT = @SoTietLT + @SoTietBT
									set @SoTietBTQD = 0
								end
							else
								begin
									set @SoTietLT=@SoTietLT
									set @SoTietBTQD = 0
								end
			
						 -- Nếu có dạy thực hành
							if (@HinhThucHoc=14)
								--set @SoTietTHQD = ROUND(@SoSinhVien/20,0) * @SoTietTH  --22.5/15 =1.5
								set @SoTietTHQD =  @SoTietTH  --22.5/15 =1.5
							else
								if (@HinhThucHoc=18) -- Có đồ án
									set @SoTietTHQD =  @SoTietTH/15 *@SoSinhVien 
								else
									set @SoTietTHQD =0

							-- Dạy Tiếng việt cho sinh viên nước ngoài
								if ((@HinhThucDay=6)OR (@HinhThucDay=12))
								begin
									 if (@SoSinhVien>=10) 	
	 										set @HeSoNhanLT=1.2 		
									  ELSE 								
										SET @HeSoNhanLT= @SoSinhVien*0.1*1.2;		

								end
							-- Dạy Tiếng việt cho sinh viên nước ngoài
							if ((@HinhThucDay=6) OR (@HinhThucDay=12))
			  
								Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= ROUND(@SoTietLT*@HeSoNhanLT,2), SoTietBTQD=ROUND(@SoTietBTQD*@HeSoNhanLT,2),SoTietTHQD= @SoTietTHQD  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
							 else
								Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= ROUND(@SoTietLT*@HeSoNhanLT*16.5/15,2), SoTietBTQD=ROUND(@SoTietBTQD*@HeSoNhanLT*16.5/15,2),SoTietTHQD= @SoTietTHQD  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

						end
				------------------------------------------

					-- Cập nhật số tiết bài tập (thảo luận) quy đổi 
					if (@HinhThucHoc=2) Or (@HinhThucHoc=3)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD= ROUND(SoTietBT,2),SoTietTHQD=0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

	
					-- Cập nhật số tiết thực hành quy đổi 
					if (@HinhThucHoc=0)
						begin
						
						if (@SoSinhVien>=10) 	
	 						SET @HeSoNhanLT=1.0		
						ELSE 			
							SET @HeSoNhanLT= @SoSinhVien*0.1;	
		
							UPDATE tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(SoTietTH* @HeSoNhanLT,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
		
						END

	
					---- Cập nhật số tiết thực hành quy đổi có tách nhóm
					if (@HinhThucHoc=19)
Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD =  ROUND(@SoSinhVien/20,0) * @SoTietTH   WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
	
	
					-- Cập nhật tiết chuẩn thực tập nghề 
					if (@HinhThucHoc=6)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = 1*@SoSinhVien WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

						-- Cập nhật tiết chuẩn thực tập TN
					if (@HinhThucHoc=7)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = 1*@SoSinhVien WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

					-- Cập nhật tiết chuẩn thực tập nghề và thực tập TN có hồ sơ đi kiểm tra, đánh giá
					if (@HinhThucHoc=16) Or (@HinhThucHoc=17)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = 1*@SoSinhVien WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

					--Cập nhật hướng dẫn thực tế ngoài trời (giờ quy chuẩn theo quyết định)
					if (@HinhThucHoc=8)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoTietTH  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

					--Cập nhật hướng dẫn đồ án môn học
					if (@HinhThucHoc=10)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*(@SoTietTH/15)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

					--Cập nhật hướng dẫn đồ án tốt nghiệp
					if (@HinhThucHoc=5)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien * 1.5 *@SoTinChi + @SoSinhVien *4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

					--Cập nhật hướng dẫn khóa luận tốt nghiệp
					if (@HinhThucHoc=15)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien * 2 *@SoTinChi  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

					--Cập nhật Học chính trị đầu, cuối khóa
					if (@HinhThucHoc=20)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=@SoTietLT * 0.9,SoTietBTQD=0, SoTietTHQD = 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
					if (@HinhThucHoc=21)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoTietTH *2.4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);



				-- Dạy  GDTC Điều chỉnh theo đề nghị của Khoa
						if (@HinhThucHoc=4)
								begin
									if (@LopChuyen=0)
										begin
										if (@SoSinhVien>=50)
											Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= 0 , SoTietBTQD=0,SoTietTHQD= ROUND(@SoTietTH/15*15.6*1.2,2)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
										else
											Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= 0 , SoTietBTQD=0,SoTietTHQD= ROUND(@SoTietTH/15*15.6,2)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
end	
									else
										begin
											set @GioDay1TC_GDTC = ROUND((16.5*@SoTietLT/(@SoTietLT+@SoTietTH)+ 15*@SoTietTH/(@SoTietLT+@SoTietTH)),1)
											if (@GioDay1TC_GDTC>15.3)
												set @GioDay1TC_GDTC = 15.3
												Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= 0 , SoTietBTQD=0,SoTietTHQD= ROUND(@SoTinChi*@GioDay1TC_GDTC,2)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
										end	
						
								end


			-- Dạy  GDTC Điều chỉnh theo văn bản 1181/QĐ, 12/5/2021. Điều chỉnh ngày 10/11/2022
						if (@HinhThucHoc=24)
								begin

										begin
										if (@SoSinhVien>=50)
											Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= 0 , SoTietBTQD=0,SoTietTHQD= ROUND(@SoTietTH/15*15*1.2,2)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
										else
											Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= 0 , SoTietBTQD=0,SoTietTHQD= ROUND(@SoTietTH/15*15,2)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
										end	
						
								end


				-- Dạy  Quy đổi thực hành kế toán
						if (@HinhThucHoc=22)
								begin
				
										if (@SoSinhVien>=50)
											Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= 0 , SoTietBTQD=0,SoTietTHQD= ROUND(@SoTietTH *1.5,2)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
										else
											if (@SoSinhVien>=30)
												Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= 0 , SoTietBTQD=0,SoTietTHQD= ROUND(@SoTietTH*1.3,2)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
						
								end

					-- Dạy  Quy đổi trực tiếp
						if (@HinhThucHoc=23)
								begin
				
										Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= SoTietLTQD , SoTietBTQD=0,SoTietTHQD= 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
						
								end				
				  END
			--- CẬP NHẬT KÊ KHAI	???	

			-- Nếu là thanh toán thỉnh giảng, thì phải xác nhận mới thanh toán được
				IF  (UPDATE(ThanhToanThinhGiang) AND (SELECT top 1  ThanhToanThinhGiang FROM INSERTED) =1) AND ((SELECT ID_LanTongHopFile FROM INSERTED) >0)
					begin
						 INSERT INTO [dbo].[tbl_CQ_KeKhai]
							  ([HS_ID]
							  ,[MaCB]
							  ,[MaNhomLopHP]
							  ,[NgayKeKhai]
							  ,[MaHocKy]
							  ,[SoTietLTKK]
							  ,[SoTietTHKK]
							  ,[SoTietBTKK]
							  ,[TuNgay1]
							  ,[DenNgay1]      
							  ,[TuNgay2]
							  ,[DenNgay2]      
							  ,[XacNhan]
							  ,LoaiThanhToan
							  ,[XacNhanThanhToan]
							  ,[ThoiGianKeKhai]
							  )     
						 SELECT  2700
								,2700
								,[MaNhomLopHP]
								,substring(format(year(getdate()),'0#'),3,2) +   format(month(getdate()),'0#') +   format(day(getdate()),'0#')
								,[MaHocKy]
								,[SoTietLTQD]				
								,[SoTietTHQD]  
								,[SoTietBTQD]
								,ltrim([NgayBatDau])
								,ltrim([NgayKetThuc])
								,ltrim([NgayBatDau2])
								,ltrim([NgayKetThuc2])
,1,9,1		
								,getdate()     
						  FROM INSERTED	
						WHERE XacNhan =1
					end
				else if (UPDATE(XacNhan) OR UPDATE(XuLyKeThieuGio))     -- Cập nhật kê khai cho cán bộ
					begin
					--Cập nhật sang phần kê khai
					--1. Xóa lớp đã kê khai
						DELETE FROM [dbo].[tbl_CQ_KeKhai] WHERE [XacNhanThanhToan] =0  AND NOT (ChuyenXacNhan =1) AND [MaNhomLopHP] = (SELECT [MaNhomLopHP] FROM INSERTED)
			
					--2. Insert lại
						if  ((SELECT TOP 1 XacNhan FROM INSERTED) >0)
						begin
							Set @HS_ID = (SELECT HS_ID FROM INSERTED)
							if (@HS_ID=0 OR @HS_ID IS NULL)
							 begin
 								IF EXISTS(SELECT HS_ID FROM view_CANBO_HoSo WHERE HS_ID_CMC IN (SELECT IDGiangVien_CMC FROM INSERTED WHERE IDGiangVien_CMC <>'')) 
								   Set @HS_ID =(SELECT TOP 1 HS_ID FROM view_CANBO_HoSo WHERE  LHD_ID <3 AND HS_ID_CMC IN (SELECT IDGiangVien_CMC FROM INSERTED))
							 end

							 if  (@HS_ID >0)
									 INSERT INTO [dbo].[tbl_CQ_KeKhai]
										  ([HS_ID]
										  ,[MaCB]
										  ,[MaNhomLopHP]
										  ,[NgayKeKhai]
										  ,[MaHocKy]
										  ,[SoTietLTKK]
										  ,[SoTietTHKK]
										  ,[SoTietBTKK]
										  ,[TuNgay1]
										  ,[DenNgay1]      
										  ,[TuNgay2]
										  ,[DenNgay2]      
										  ,[XacNhan]
										 -- ,[GhiChu]
										  ,[XacNhanThanhToan]
										  ,[ThoiGianKeKhai]
										  )     
									 SELECT  @HS_ID
											,@HS_ID
											,[MaNhomLopHP]
											,substring(format(year(getdate()),'0#'),3,2) +   format(month(getdate()),'0#') +   format(day(getdate()),'0#')
											,[MaHocKy]
											,[SoTietLTQD]				
											,[SoTietTHQD]  
											,[SoTietBTQD]
											,ltrim([NgayBatDau])
											,ltrim([NgayKetThuc])
											,ltrim([NgayBatDau2])
											,ltrim([NgayKetThuc2])  				
											,0,0		
											,getdate()     
									  FROM INSERTED
									  WHERE XacNhan=1
						end  -- of((SELECT TOP 1 XacNhan FROM INSERTED) >0)
					end				
				END --??	
			ELSE  -- Nếu kỳ >=26 
				BEGIN
				--THEO QUY CHẾ CHI TIÊU NỘI BỘ NĂM 2024, Từ học kỳ 2-2023-2024 trở về sau
				-- Xác định hệ số nhân lý thuyết và tính giờ cho các hình thức học: Lý thuyết, Lý thuyết & Thảo luận, Lý thuyết & Bài tập,Lý thuyết & Thực hành
				if (UPDATE(SoSinhVien) OR UPDATE(MaHTHoc) OR UPDATE(MaHTDay) OR UPDATE(SoTinChi) OR UPDATE(SoTietLT) OR UPDATE(SoTietTH) OR UPDATE(SoTietBT) OR UPDATE(SoTietDA) OR UPDATE(SoTietThucTap) OR UPDATE(SoTietDoAnKhoaLuan))
					BEGIN

					if (@HinhThucHoc=1 or @HinhThucHoc=12 or @HinhThucHoc=13 or @HinhThucHoc =26 or  @HinhThucHoc =0 or @HinhThucHoc=30 )
						begin
						 Set @HeSoNhanLT =0
						-- Dạy online
							if (@HinhThucDay=2)
								begin
									if (@SoPhong>=4)
										set @HeSoNhanLT=3.0
									else
										if (@SoPhong>=3)
											set @HeSoNhanLT=2.0
										ELSE
											if (@SoPhong>=2)
												SET @HeSoNhanLT= 1.5
ELSE 
												SET @HeSoNhanLT= 1.0
								end

						-- Dạy bằng Tiếng Anh thi bằng Tiếng Việt
							if (@HinhThucDay=10)
								begin
									if (@SoSinhVien>100) 	
										set @HeSoNhanLT= 1.5*1.5
									else 
										if (@SoSinhVien>80) 	
											set @HeSoNhanLT=1.4*1.5
										ELSE
											if (@SoSinhVien>60) 	
												set @HeSoNhanLT=1.3*1.5
											ELSE
											   if (@SoSinhVien>50) 	
	 												SET @HeSoNhanLT=1.2*1.5	
												ELSE 		
													if (@SoSinhVien>40) 	
														set @HeSoNhanLT=1.1*1.5
													ELSE
													   if (@SoSinhVien>=10) 	
															SET @HeSoNhanLT= 1*1.5;		
														ELSE if (@SoSinhVien>5) 							
															SET @HeSoNhanLT= 1.5*@SoSinhVien*0.1;	
														ElSE 
															SET @HeSoNhanLT= 1.5*0.5;
								end


							-- Dạy bằng Tiếng Anh thi bằng Tiếng Anh
							if (@HinhThucDay=11)
								begin
									if (@SoSinhVien>100) 	
										set @HeSoNhanLT= 1.5*2
									else 
										if (@SoSinhVien>80) 	
											set @HeSoNhanLT=1.4*2
										ELSE
											if (@SoSinhVien>60) 	
												set @HeSoNhanLT=1.3*2
											ELSE
											   if (@SoSinhVien>50) 	
	 												SET @HeSoNhanLT=1.2*2	
												ELSE 		
													if (@SoSinhVien>40) 	
														set @HeSoNhanLT=1.1*2
													ELSE
													   if (@SoSinhVien>=10) 	
															SET @HeSoNhanLT= 1*2;		
														ELSE if (@SoSinhVien>5) 								
															SET @HeSoNhanLT= 2*@SoSinhVien*0.1;	
														ELSE
															SET @HeSoNhanLT= 2*0.5;
								end
			
							-- Dạy bình thường - quy đổi lớp đông
							if (@HinhThucDay=1)
								begin
									if (@SoSinhVien>100) 	
										set @HeSoNhanLT= 1.5
									else 
										if (@SoSinhVien>80) 	
											set @HeSoNhanLT=1.4
										ELSE
											if (@SoSinhVien>60) 	
												set @HeSoNhanLT=1.3
											ELSE
											   if (@SoSinhVien>50) 	
	 												SET @HeSoNhanLT=1.2	
												ELSE 		
													if (@SoSinhVien>40) 	
														set @HeSoNhanLT=1.1
													ELSE
													   if (@SoSinhVien>=10) 	
															SET @HeSoNhanLT= 1;		
														ELSE if (@SoSinhVien>5) 								
															SET @HeSoNhanLT= @SoSinhVien*0.1;	
														ELSE
															SET @HeSoNhanLT=0.5
								end

							-- Dạy ngành ngôn ngữ Anh
							if (@HinhThucDay=5)
								begin
									if (@SoSinhVien>70) 	
										set @HeSoNhanLT= 1.5
									else 
										if (@SoSinhVien>60) 	
											set @HeSoNhanLT=1.4
										ELSE
											if (@SoSinhVien>50) 	
												set @HeSoNhanLT=1.3
											ELSE
													if (@SoSinhVien>40) 	
														set @HeSoNhanLT=1.2
													ELSE
														if (@SoSinhVien>=10) 	
															SET @HeSoNhanLT= 1;		
														ELSE 
															if (@SoSinhVien>5) 								
																SET @HeSoNhanLT= @SoSinhVien*0.1;
ELSE
																SET @HeSoNhanLT=0.5

								end
			

							-- Cập nhật số tiết lý thuyết quy đổi (Lý thuyết + Thảo luận (Bài tập)
								if (@HinhThucHoc=12 or @HinhThucHoc=13) 
									set @SoTietLT = @SoTietLT + @SoTietBT
								if (@HinhThucHoc=30)
									set @SoTietLT = @SoTietLT + @SoTietDA
								
								if (@HinhThucHoc=26) -- Dạy học dự án
									UPDATE tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(((SoTietDA+SoTietLT)/15*15)*@HeSoHocPhi*@HeSoNhanLT,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);						
								else if (@HinhThucHoc=0) -- Dạy thực hành
									UPDATE tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(SoTietTH* 15/15* @HeSoNhanLT,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
								else
									Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= ROUND(@SoTietLT*@HeSoNhanLT*15/15,2), SoTietBTQD=0,SoTietTHQD= 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);


						  end -- of if (@HinhThucHoc=1)
						
						--else if (@HinhThucHoc=0) -- Dạy thực hành
						--	begin
						--		if (@SoSinhVien>=10) 	
						--				SET @HeSoNhanLT= 1;		
						--		ELSE IF  (@SoSinhVien>5)								
						--			SET @HeSoNhanLT= @SoSinhVien*0.1;	
						--		ELSE
						--			SET @HeSoNhanLT=0.5
						--		UPDATE tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(SoTietTH* 15/15* @HeSoNhanLT,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
						--	end
						-- Cập nhật tiết chuẩn thực tập TN
						else if (@HinhThucHoc=7)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = 1*@SoSinhVien WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

						-- Cập nhật tiết chuẩn thực tập nghề  có hồ sơ đi kiểm tra, đánh giá
						else if (@HinhThucHoc=16) 
							begin
								if (@SoSinhVien >=20)
									Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(SoTietTH*1.5,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
								else
									Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = SoTietTH WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
							end
						--Cập nhật hướng dẫn đồ án tốt nghiệp
						else if (@HinhThucHoc=5 or @HinhThucHoc=15)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien * 1.5 * (@SoTietDoAnKhoaLuan/15) + @SoSinhVien *0.4 *(@SoTietDoAnKhoaLuan/15)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
						else if (@HinhThucHoc=10)	--Cập nhật hướng dẫn đồ án môn học
							begin
									if ((@KhoaHoc LIKE N'%K58%') OR (@KhoaHoc LIKE N'%K59%') OR (@KhoaHoc LIKE N'%K60%') OR  (@KhoaHoc LIKE N'%KKhóa 61%'))
Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*(@SoTietTH/15)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
									else
										Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*(@SoTietDA/15)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
							end
						 else if (@HinhThucHoc=28)	--Cập nhật Kiểm tra thực tập do cán bộ người trường hướng dẫn
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*@SoTinChi/4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
						else if (@HinhThucHoc=27)	--Cập nhật Kiểm tra kiến tập sư phạm
								Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*@SoTinChi/4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
						else if (@HinhThucHoc=29)	--Cập nhật Lý thuyết GDTC
									Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= ROUND(@SoTietLT,2), SoTietBTQD=0,SoTietTHQD= 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
						else if (@HinhThucHoc=23)	--Quy đổi trực tiếp
									Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD = SoTietLTQD, SoTietBTQD=0,SoTietTHQD= 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
					--Cập nhật hướng dẫn đồ án tốt nghiệp khoá 61 về trước
						else if (@HinhThucHoc=32)
							Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien * 1.5 *@SoTinChi + @SoSinhVien *4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);

					else if NOT (@HinhThucHoc IN (0,1,12,13,26,7,16,5,15,10,27,28,29,23,32)) 
							UPDATE tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = 0 WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
					END
			--- CẬP NHẬT KÊ KHAI		

			-- Nếu là thanh toán thỉnh giảng, thì phải xác nhận mới thanh toán được
				IF  (UPDATE(ThanhToanThinhGiang) AND (SELECT top 1  ThanhToanThinhGiang FROM INSERTED) =1) AND ((SELECT ID_LanTongHopFile FROM INSERTED) >0)
						 INSERT INTO [dbo].[tbl_CQ_KeKhai]
							  ([HS_ID]
							  ,[MaCB]
							  ,[MaNhomLopHP]
							  ,[NgayKeKhai]
							  ,[MaHocKy]
							  ,[SoTietLTKK]
							  ,[SoTietTHKK]
							  ,[SoTietBTKK]
							  ,[TuNgay1]
							  ,[DenNgay1]      
							  ,[TuNgay2]
							  ,[DenNgay2]      
							  ,[XacNhan]
							  ,LoaiThanhToan
							  ,[XacNhanThanhToan]
							  ,[ThoiGianKeKhai]
							  )     
						 SELECT  2700
								,2700
								,[MaNhomLopHP]
								,substring(format(year(getdate()),'0#'),3,2) +   format(month(getdate()),'0#') +   format(day(getdate()),'0#')
								,[MaHocKy]
								,[SoTietLTQD]				
								,[SoTietTHQD]  
								,[SoTietBTQD]
								,ltrim([NgayBatDau])
								,ltrim([NgayKetThuc])
								,ltrim([NgayBatDau2])
								,ltrim([NgayKetThuc2])  				
								,1,9,1
,getdate()     
						  FROM INSERTED	
						WHERE XacNhan =1

				else --if (UPDATE(XacNhan) OR UPDATE(XuLyKeThieuGio))     -- Cập nhật kê khai cho cán bộ
					begin
						--Cập nhật sang phần kê khai
						--1. Xóa lớp đã kê khai
							DELETE FROM [dbo].[tbl_CQ_KeKhai] WHERE [XacNhanThanhToan] =0  AND NOT (ChuyenXacNhan =1) AND [MaNhomLopHP] = (SELECT [MaNhomLopHP] FROM INSERTED)
			
						--2. Insert lại
						if  ((SELECT TOP 1 XacNhan FROM INSERTED) >0)
						begin
							Set @HS_ID = (SELECT HS_ID FROM INSERTED)
							if (@HS_ID=0 OR @HS_ID IS NULL)
							 begin
 								IF EXISTS(SELECT HS_ID FROM view_CANBO_HoSo WHERE HS_ID_CMC IN (SELECT IDGiangVien_CMC FROM INSERTED WHERE IDGiangVien_CMC <>'')) 
								   Set @HS_ID =(SELECT TOP 1 HS_ID FROM view_CANBO_HoSo WHERE  LHD_ID <3 AND HS_ID_CMC IN (SELECT IDGiangVien_CMC FROM INSERTED))
							 end

							 if  (@HS_ID >0)
									 INSERT INTO [dbo].[tbl_CQ_KeKhai]
										  ([HS_ID]
										  ,[MaCB]
										  ,[MaNhomLopHP]
										  ,[NgayKeKhai]
										  ,[MaHocKy]
										  ,[SoTietLTKK]
										  ,[SoTietTHKK]
										  ,[SoTietBTKK]
										  ,[TuNgay1]
										  ,[DenNgay1]      
										  ,[TuNgay2]
										  ,[DenNgay2]      
										  ,[XacNhan]
										 -- ,[GhiChu]
										  ,[XacNhanThanhToan]
										  ,[ThoiGianKeKhai]
										  )     
									 SELECT  @HS_ID
											,@HS_ID
											,[MaNhomLopHP]
											,substring(format(year(getdate()),'0#'),3,2) +   format(month(getdate()),'0#') +   format(day(getdate()),'0#')
											,[MaHocKy]
											,[SoTietLTQD]				
											,[SoTietTHQD]  
											,[SoTietBTQD]
											,ltrim([NgayBatDau])
											,ltrim([NgayKetThuc])
											,ltrim([NgayBatDau2])
											,ltrim([NgayKetThuc2])  				
											,0,0		
											,getdate()     
									  FROM INSERTED
									  WHERE XacNhan=1
							end -- of if  ((SELECT TOP 1 XacNhan FROM INSERTED) >0)
						end --else if (UPDATE(XacNhan) OR UPDATE(XuLyKeThieuGio))     -- Cập nhật kê khai cho cán bộ

			END -- of ELSE IF (@MaHocKy >=26)
		END
	END
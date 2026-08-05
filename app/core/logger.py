import logging
from logging.handlers import TimedRotatingFileHandler, RotatingFileHandler
import os
import time
import json

# Đảm bảo 2 thư mục logs tồn tại
LOG_DIR_REQUESTS = "logs/requests"
LOG_DIR_ERRORS = "logs/errors"
os.makedirs(LOG_DIR_REQUESTS, exist_ok=True)
os.makedirs(LOG_DIR_ERRORS, exist_ok=True)

class TimeAndSizeRotatingFileHandler(TimedRotatingFileHandler):
    """
    Lớp xử lý Log kết hợp cắt theo Ngày và theo Dung lượng.
    - Cắt lúc nửa đêm.
    - Nếu file vượt quá MaxBytes trong ngày, tự động cắt và thêm số đuôi (.1, .2).
    """
    def __init__(self, filename, when='midnight', interval=1, backupCount=30, encoding="utf-8", maxBytes=10 * 1024 * 1024):
        super().__init__(filename=filename, when=when, interval=interval, backupCount=backupCount, encoding=encoding)
        self.maxBytes = maxBytes

    def shouldRollover(self, record):
        if self.stream is None:
            self.stream = self._open()
        
        if self.maxBytes > 0:
            msg = "%s\n" % self.format(record)
            self.stream.seek(0, 2) 
            if self.stream.tell() + len(msg.encode(self.encoding or 'utf-8')) >= self.maxBytes:
                return 1
                
        return super().shouldRollover(record)

    def doRollover(self):
        """ Xử lý việc cắt file và đổi tên file """
        if self.stream:
            self.stream.close()
            self.stream = None
            
        currentTime = int(time.time())
        t = self.rolloverAt - self.interval
        timeTuple = time.localtime(t)
        
        dfn = self.rotation_filename(self.baseFilename + "." + time.strftime(self.suffix, timeTuple))
        
        if os.path.exists(dfn):
            base_dfn = dfn
            counter = 1
            while os.path.exists(f"{base_dfn}.{counter}"):
                counter += 1
            dfn = f"{base_dfn}.{counter}"
            
        self.rotate(self.baseFilename, dfn)
        
        if self.backupCount > 0:
            for s in self.getFilesToDelete():
                try:
                    os.remove(s)
                except Exception:
                    pass
                    
        if not self.delay:
            self.stream = self._open()
            
        self.rolloverAt = self.computeRollover(currentTime)

# Khởi tạo định dạng chung
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

class JsonFormatter(logging.Formatter):
    """
    Format Log thành chuẩn JSON Lines (Mỗi dòng là 1 JSON Object)
    Cực kỳ tối ưu để hiển thị lên Giao diện UI hoặc cho AI đọc.
    """
    def format(self, record):
        if isinstance(record.msg, dict):
            log_record = {
                "time": self.formatTime(record, self.datefmt),
                **record.msg
            }
        else:
            log_record = {
                "time": self.formatTime(record, self.datefmt),
                "level": record.levelname,
                "message": record.getMessage()
            }
        return json.dumps(log_record, ensure_ascii=False)

json_formatter = JsonFormatter(datefmt="%Y-%m-%d %H:%M:%S")

# =====================================================================
# 1. LOGGER DÀNH CHO REQUESTS (Truy cập API)
# Cắt theo Ngày + Dung lượng (10MB)
# =====================================================================
request_logger = logging.getLogger("QLGD_requests")
request_logger.setLevel(logging.INFO)

request_handler = TimeAndSizeRotatingFileHandler(
    filename=f"{LOG_DIR_REQUESTS}/access.log",
    when="midnight", 
    interval=1,
    backupCount=30,
    encoding="utf-8",
    maxBytes=10 * 1024 * 1024  # 10 MB
)
request_handler.setFormatter(json_formatter) # Ghi ra file bằng JSON
request_logger.addHandler(request_handler)
request_logger.addHandler(console_handler) # In ra Terminal thì vẫn dùng text thường cho dễ đọc

# =====================================================================
# 2. LOGGER DÀNH CHO LỖI HỆ THỐNG (Exception, Database, Redis Error)
# Chỉ cắt theo Dung lượng (5MB)
# =====================================================================
app_logger = logging.getLogger("QLGD_errors")
app_logger.setLevel(logging.INFO) # Cho phép in INFO ra màn hình, nhưng chỉ ghi ERROR vào file

error_handler = RotatingFileHandler(
    filename=f"{LOG_DIR_ERRORS}/error.log",
    maxBytes=5 * 1024 * 1024, # 5 MB
    backupCount=10,
    encoding="utf-8"
)
error_handler.setLevel(logging.ERROR) # BỘ LỌC CỰC QUAN TRỌNG: Chỉ ghi ERROR vào file này
error_handler.setFormatter(formatter)
app_logger.addHandler(error_handler)
app_logger.addHandler(console_handler)

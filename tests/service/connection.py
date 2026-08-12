from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

DATABASE_URL = (
    "mssql+pyodbc://@CHUONG_BON:51433/DBThanhToanThuaGio"
    "?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
)
try:
    print("Đang kết nối SQL Server...")

    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"timeout": 10},
    )

    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT
                    @@SERVERNAME AS ServerName,
                    DB_NAME() AS DatabaseName,
                    SUSER_SNAME() AS LoginName
            """)
        ).fetchone()

        if row:
            print("✅ KẾT NỐI SQL SERVER THÀNH CÔNG!")
            print(f"Server   : {row.ServerName}")
            print(f"Database : {row.DatabaseName}")
            print(f"Login    : {row.LoginName}")

except SQLAlchemyError as e:
    print("❌ KẾT NỐI THẤT BẠI!")
    print(type(e).__name__)
    print(e)
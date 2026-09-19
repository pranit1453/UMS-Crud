import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    pg_user = os.getenv("POSTGRES_USER", "postgres")
    pg_password = os.getenv("POSTGRES_PASSWORD", "postgres")
    pg_host = os.getenv("POSTGRES_HOST", "localhost")
    pg_port = os.getenv("POSTGRES_PORT", "5430")
    pg_db = os.getenv("POSTGRES_DB", "ums_db")

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        f"postgresql+psycopg://{pg_user}:{pg_password}@{pg_host}:{pg_port}/{pg_db}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
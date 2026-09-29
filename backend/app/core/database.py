import os
import socket
import logging
from urllib.parse import urlparse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

logger = logging.getLogger("tempora.db")

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

use_sqlite = False

# Check if PostgreSQL host:port is reachable over network
if "sqlite" not in db_url:
    try:
        parsed = urlparse(db_url)
        host = parsed.hostname
        port = parsed.port or 5432
        # Quick 2.0-second TCP probe to ensure port 5432 is accessible from this network
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2.0)
        result = sock.connect_ex((host, port))
        sock.close()
        if result != 0:
            print(f"[!] Warning: Remote PostgreSQL {host}:{port} is unreachable on this network (code {result}). Activating local SQLite fallback.")
            use_sqlite = True
    except Exception as e:
        print(f"[!] Warning: Error probing PostgreSQL ({e}). Activating local SQLite fallback.")
        use_sqlite = True

if use_sqlite:
    sqlite_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../tempora.db"))
    db_url = f"sqlite:///{sqlite_db_path}"
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        future=True
    )
else:
    if "sslmode=" not in db_url:
        separator = "&" if "?" in db_url else "?"
        db_url = f"{db_url}{separator}sslmode=require"

    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
        connect_args={
            "connect_timeout": 5,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        },
        future=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

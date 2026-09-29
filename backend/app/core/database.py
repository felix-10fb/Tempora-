import os
import socket
import logging
from urllib.parse import urlparse
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("tempora.db")

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

is_production = (
    settings.ENVIRONMENT.lower() in {"prod", "production"}
    or os.getenv("VERCEL_ENV", "").lower() in {"production", "preview"}
)

use_sqlite = False
sqlite_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../tempora.db"))
normalized_sqlite_path = sqlite_db_path.replace(os.sep, "/")
sqlite_url = f"sqlite:///{normalized_sqlite_path}"

# 1. Check if PostgreSQL host:port is reachable over network
if "sqlite" not in db_url:
    try:
        parsed = urlparse(db_url)
        host = parsed.hostname
        port = parsed.port or 5432
        # Quick 3.0-second TCP probe to ensure host and port are reachable
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3.0)
        result = sock.connect_ex((host, port))
        sock.close()
        if result != 0:
            print(f"[!] Warning: Remote PostgreSQL {host}:{port} is unreachable on this network (code {result}).")
            use_sqlite = True
    except Exception as e:
        print(f"[!] Warning: Error probing PostgreSQL host ({e}).")
        use_sqlite = True
else:
    use_sqlite = True

if use_sqlite and is_production:
    raise RuntimeError("PostgreSQL is required in production; refusing to use ephemeral SQLite.")

# 2. Verify the PostgreSQL connection before allowing development fallback.
if not use_sqlite:
    try:
        if "sslmode=" not in db_url:
            separator = "&" if "?" in db_url else "?"
            db_url = f"{db_url}{separator}sslmode=require"

        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            connect_args={
                "connect_timeout": 15,
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5
            },
            future=True
        )
        with engine.connect() as test_conn:
            test_conn.execute(text("SELECT 1"))
        print("[+] Verified database connection: Remote PostgreSQL (Neon).")
    except Exception as e:
        print(f"[!] Warning: Remote PostgreSQL connection verification failed ({e}).")
        use_sqlite = True

if use_sqlite and is_production:
    raise RuntimeError("PostgreSQL connection failed in production; refusing to use ephemeral SQLite.")

if use_sqlite:
    db_url = sqlite_url
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        future=True
    )
    print(f"[+] Verified database connection: Local SQLite ({sqlite_db_path}).")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def check_db_health():
    """Verify database responsiveness for health checks and status reporting."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "connected", "sqlite" if "sqlite" in str(engine.url) else "postgresql"
    except Exception as e:
        return False, str(e), "unknown"

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


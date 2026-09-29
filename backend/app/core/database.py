from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

# Neon PostgreSQL connection string handling
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ensure sslmode=require for Neon if not specified
if "sslmode=" not in db_url and "sqlite" not in db_url:
    separator = "&" if "?" in db_url else "?"
    db_url = f"{db_url}{separator}sslmode=require"

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "connect_timeout": 15,
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

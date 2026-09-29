import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "TEMPORA"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Neon Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_PnofHuBjd3U2@ep-late-rice-b3tznt7s-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )
    
    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "tempora-super-secret-jwt-key-2025-min32chars-security-token")
    JWT_REFRESH_SECRET: str = os.getenv("JWT_REFRESH_SECRET", "tempora-super-secret-refresh-key-2025-min32chars")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://tempora.vercel.app",
        "*"
    ]
    
    # Google API Keys
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # AI Engine
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    
    # Payment Keys
    PAYMENT_PROVIDER: str = os.getenv("PAYMENT_PROVIDER", "stripe")
    PAYMENT_KEY_ID: str = os.getenv("PAYMENT_KEY_ID", "pk_test_sample_tempora")
    PAYMENT_KEY_SECRET: str = os.getenv("PAYMENT_KEY_SECRET", "sk_test_sample_tempora")
    
    # Platform Commission & Fee Rules
    PLATFORM_FEE_PERCENTAGE: float = 0.05  # 5%
    PROTECTION_FEE_PERCENTAGE: float = 0.03  # 3%
    MIN_DELIVERY_FEE: float = 99.0
    BASE_DELIVERY_PER_KM: float = 18.0

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore"
    }

settings = Settings()

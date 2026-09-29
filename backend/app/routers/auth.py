from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Dict
import uuid

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    decode_token, security
)
from backend.app.models.models import User, UserPreference, UserRole
from backend.app.schemas.schemas import (
    RegisterRequest, LoginRequest, GoogleAuthRequest, RefreshTokenRequest,
    Token, UserResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    credentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials, settings.JWT_SECRET)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is suspended")
    return user

@router.post("/register", response_model=Token)
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    role = req.role if req.role in [UserRole.CUSTOMER, UserRole.OWNER] else UserRole.CUSTOMER
    
    new_user = User(
        id=str(uuid.uuid4()),
        name=req.name,
        email=req.email.lower(),
        phone=req.phone,
        password_hash=hash_password(req.password),
        role=role,
        is_verified=False,
        is_active=True,
        trust_score=85,
        profile_image=f"https://api.dicebear.com/7.x/avataaars/svg?seed={req.name}"
    )
    db.add(new_user)
    db.flush()

    # Create default user preference
    pref = UserPreference(
        user_id=new_user.id,
        preferred_categories=["Furniture", "Electronics"],
        preferred_radius=15.0,
        preferred_budget=10000.0
    )
    db.add(pref)
    db.commit()
    db.refresh(new_user)

    token_data = {"sub": new_user.id, "email": new_user.email, "role": new_user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=Token)
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not user.password_hash or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is suspended. Please contact support.")

    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/google", response_model=Token)
def google_auth(req: GoogleAuthRequest, db: Session = Depends(get_db)):
    email = req.email.lower() if req.email else "google_user@tempora.io"
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            id=str(uuid.uuid4()),
            name=req.name or "Google User",
            email=email,
            role=UserRole.CUSTOMER,
            is_verified=True,
            is_active=True,
            trust_score=90,
            profile_image=req.profile_image or f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"
        )
        db.add(user)
        db.flush()
        pref = UserPreference(user_id=user.id)
        db.add(pref)
        db.commit()
        db.refresh(user)

    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/refresh", response_model=Dict[str, str])
def refresh_access_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token, settings.JWT_REFRESH_SECRET)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return user

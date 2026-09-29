from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import User, UserPreference, Address
from app.schemas.schemas import (
    UserResponse, UserUpdate, UserPreferenceSchema
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_my_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.bio is not None:
        current_user.bio = data.bio
    if data.profile_image is not None:
        current_user.profile_image = data.profile_image

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/preferences", response_model=UserPreferenceSchema)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return UserPreferenceSchema(
        preferred_categories=pref.preferred_categories or [],
        preferred_radius=pref.preferred_radius or 15.0,
        preferred_budget=pref.preferred_budget or 10000.0,
        preferred_style=pref.preferred_style or "Modern",
        preferred_language=pref.preferred_language or "English",
        notification_preferences=pref.notification_preferences or {"email": True, "sms": True, "push": True}
    )

@router.put("/preferences", response_model=UserPreferenceSchema)
def update_preferences(
    data: UserPreferenceSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    pref.preferred_categories = data.preferred_categories
    pref.preferred_radius = data.preferred_radius
    pref.preferred_budget = data.preferred_budget
    pref.preferred_style = data.preferred_style
    pref.preferred_language = data.preferred_language
    pref.notification_preferences = data.notification_preferences

    db.commit()
    return data

@router.get("/{user_id}/profile", response_model=UserResponse)
def get_public_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

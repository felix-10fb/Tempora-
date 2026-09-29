from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import uuid

from backend.app.core.database import get_db
from backend.app.models.models import Review, Listing, User
from backend.app.schemas.schemas import ReviewCreate, ReviewResponse
from backend.app.routers.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/listing/{listing_id}", response_model=List[ReviewResponse])
def get_listing_reviews(listing_id: str, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.listing_id == listing_id).order_by(Review.created_at.desc()).all()
    return reviews

@router.post("", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    new_review = Review(
        id=str(uuid.uuid4()),
        booking_id=data.booking_id,
        reviewer_id=current_user.id,
        reviewee_id=listing.owner_id,
        listing_id=listing.id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(new_review)
    db.flush()

    # Recalculate listing rating
    stats = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count")
    ).filter(Review.listing_id == listing.id).first()

    if stats:
        listing.rating = round(float(stats.avg_rating or 5.0), 1)
        listing.review_count = int(stats.count or 1)

    # Update owner trust score slightly
    owner = db.query(User).filter(User.id == listing.owner_id).first()
    if owner:
        if data.rating >= 4:
            owner.trust_score = min(100, (owner.trust_score or 85) + 1)
        elif data.rating <= 2:
            owner.trust_score = max(50, (owner.trust_score or 85) - 3)

    db.commit()
    db.refresh(new_review)
    return new_review

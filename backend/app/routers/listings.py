from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.models.models import (
    Listing, ListingImage, Category, User, UserRole, ListingStatus
)
from app.schemas.schemas import (
    ListingCreate, ListingUpdate, ListingResponse
)
from app.routers.auth import get_current_user
from app.core.storage import save_base64_image

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.get("/categories/all")
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).filter(Category.is_active == True).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "icon": c.icon,
            "image_url": c.image_url
        }
        for c in cats
    ]

@router.get("", response_model=List[ListingResponse])
def get_listings(
    category: Optional[str] = None,
    city: Optional[str] = None,
    query: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    sort_by: Optional[str] = "popular", # popular, price_low, price_high, newest
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db)
):
    q = db.query(Listing).filter(Listing.status == ListingStatus.APPROVED)

    if category and category != "All":
        q = q.filter(Listing.category == category)
    if city:
        q = q.filter(Listing.city.ilike(f"%{city}%"))
    if query:
        search_filter = or_(
            Listing.title.ilike(f"%{query}%"),
            Listing.description.ilike(f"%{query}%"),
            Listing.category.ilike(f"%{query}%"),
            Listing.subcategory.ilike(f"%{query}%")
        )
        q = q.filter(search_filter)
    if min_price is not None:
        q = q.filter(Listing.price_per_day >= min_price)
    if max_price is not None:
        q = q.filter(Listing.price_per_day <= max_price)
    if condition:
        q = q.filter(Listing.condition == condition)

    if sort_by == "price_low":
        q = q.order_by(Listing.price_per_day.asc())
    elif sort_by == "price_high":
        q = q.order_by(Listing.price_per_day.desc())
    elif sort_by == "newest":
        q = q.order_by(Listing.created_at.desc())
    else:
        q = q.order_by(Listing.rating.desc(), Listing.created_at.desc())

    listings = q.offset(skip).limit(limit).all()
    return listings

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing_detail(listing_id: str, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.post("", response_model=ListingResponse)
def create_listing(
    data: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If user was customer, upgrade role to OWNER automatically upon first listing
    if current_user.role == UserRole.CUSTOMER:
        current_user.role = UserRole.OWNER
        db.add(current_user)

    new_listing = Listing(
        id=str(uuid.uuid4()),
        owner_id=current_user.id,
        title=data.title,
        description=data.description,
        category=data.category,
        subcategory=data.subcategory,
        condition=data.condition,
        price_per_day=data.price_per_day,
        price_per_week=data.price_per_week if data.price_per_week else round(data.price_per_day * 6, 2),
        price_per_month=data.price_per_month if data.price_per_month else round(data.price_per_day * 22, 2),
        security_deposit=data.security_deposit,
        location=data.location,
        city=data.city,
        latitude=data.latitude,
        longitude=data.longitude,
        status=ListingStatus.APPROVED,
        verification_status="VERIFIED",
        rules=data.rules,
        specifications=data.specifications or {},
        delivery_available=data.delivery_available,
        pickup_available=data.pickup_available,
        rating=5.0,
        review_count=0
    )
    db.add(new_listing)
    db.flush()

    for idx, raw_img in enumerate(data.images):
        saved_img = save_base64_image(raw_img)
        img = ListingImage(
            id=str(uuid.uuid4()),
            listing_id=new_listing.id,
            image_url=saved_img,
            sort_order=idx
        )
        db.add(img)

    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: str,
    data: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    # Check permissions
    if listing.owner_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_data = data.model_dump(exclude_unset=True)
    images_data = update_data.pop("images", None)

    for field, val in update_data.items():
        setattr(listing, field, val)

    if images_data is not None:
        db.query(ListingImage).filter(ListingImage.listing_id == listing.id).delete()
        for idx, raw_img in enumerate(images_data):
            saved_img = save_base64_image(raw_img)
            img = ListingImage(
                id=str(uuid.uuid4()),
                listing_id=listing.id,
                image_url=saved_img,
                sort_order=idx
            )
            db.add(img)

    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/{listing_id}")
def delete_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.owner_id != current_user.id and current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return {"success": True, "message": "Listing deleted successfully"}

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.core.database import get_db
from app.core.ai_engine import AIEngine
from app.models.models import Listing, User, ListingStatus
from app.schemas.schemas import ListingResponse
from app.routers.maps import TAMIL_NADU_PINCODES

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=List[ListingResponse])
def search_marketplace(
    q: Optional[str] = None,
    category: Optional[str] = None,
    categories: Optional[str] = None, # comma-separated list of categories
    subcategory: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    conditions: Optional[str] = None, # comma-separated list of conditions
    min_rating: Optional[float] = None,
    delivery: Optional[bool] = None,
    pickup: Optional[bool] = None,
    verified_only: Optional[bool] = None,
    pincode: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None,
    sort_by: Optional[str] = "popular", # popular, price_low, price_high, rating, newest, distance
    skip: int = Query(0, ge=0),
    limit: int = Query(40, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Listing).filter(Listing.status == ListingStatus.APPROVED)

    # 1. Text Search across Title, Description, Category, Subcategory, Location
    if q:
        filter_terms = or_(
            Listing.title.ilike(f"%{q}%"),
            Listing.description.ilike(f"%{q}%"),
            Listing.category.ilike(f"%{q}%"),
            Listing.subcategory.ilike(f"%{q}%"),
            Listing.location.ilike(f"%{q}%"),
            Listing.city.ilike(f"%{q}%")
        )
        query = query.filter(filter_terms)

    # 2. Multi-Category or Single Category Filter
    active_categories = []
    if categories:
        active_categories = [c.strip() for c in categories.split(",") if c.strip() and c.strip().lower() != "all"]
    elif category and category.lower() != "all":
        active_categories = [category]
    
    if active_categories:
        query = query.filter(Listing.category.in_(active_categories))

    if subcategory:
        query = query.filter(Listing.subcategory == subcategory)

    # 3. Price Filter (Daily Rate)
    if min_price is not None:
        query = query.filter(Listing.price_per_day >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_day <= max_price)

    # 4. Multi-Condition or Single Condition Filter
    active_conditions = []
    if conditions:
        active_conditions = [c.strip() for c in conditions.split(",") if c.strip() and c.strip().lower() != "all"]
    elif condition and condition.lower() != "all":
        active_conditions = [condition]

    if active_conditions:
        query = query.filter(Listing.condition.in_(active_conditions))

    # 5. Rating Filter
    if min_rating is not None and min_rating > 0:
        query = query.filter(Listing.rating >= min_rating)

    # 6. Logistics Filters
    if delivery is True:
        query = query.filter(Listing.delivery_available == True)
    if pickup is True:
        query = query.filter(Listing.pickup_available == True)

    # 7. Verified Owner Only
    if verified_only is True:
        query = query.join(User, Listing.owner_id == User.id).filter(User.is_verified == True)

    results = query.all()

    # 8. Pincode to Lat/Lng resolution if pincode specified
    center_lat = lat
    center_lng = lng
    if pincode and (center_lat is None or center_lng is None):
        matched_pin = next((p for p in TAMIL_NADU_PINCODES if p["pincode"] == pincode.strip()), None)
        if matched_pin:
            center_lat = matched_pin["lat"]
            center_lng = matched_pin["lng"]

    # 9. Geo-distance calculation and radius filtering
    if center_lat is not None and center_lng is not None:
        items_with_distance = []
        for item in results:
            dist = AIEngine.calculate_distance(center_lat, center_lng, item.latitude, item.longitude)
            if radius_km is None or dist <= radius_km:
                # Attach distance temporarily for sorting
                setattr(item, "_dist", dist)
                items_with_distance.append(item)
        results = items_with_distance

    # 10. Precision Sorting
    if sort_by == "price_low":
        results = sorted(results, key=lambda x: x.price_per_day)
    elif sort_by == "price_high":
        results = sorted(results, key=lambda x: x.price_per_day, reverse=True)
    elif sort_by == "rating":
        results = sorted(results, key=lambda x: x.rating, reverse=True)
    elif sort_by == "newest":
        results = sorted(results, key=lambda x: str(x.created_at or ""), reverse=True)
    elif sort_by == "distance" and center_lat is not None and center_lng is not None:
        results = sorted(results, key=lambda x: getattr(x, "_dist", 99999))
    else: # popular default
        results = sorted(results, key=lambda x: (x.rating, x.review_count), reverse=True)

    return results[skip : skip + limit]


from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from backend.app.core.database import get_db
from backend.app.core.ai_engine import AIEngine
from backend.app.models.models import Listing, User, ListingStatus
from backend.app.schemas.schemas import ListingResponse

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=List[ListingResponse])
def search_marketplace(
    q: Optional[str] = None,
    category: Optional[str] = None,
    subcategory: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    min_rating: Optional[float] = None,
    delivery: Optional[bool] = None,
    pickup: Optional[bool] = None,
    verified_only: Optional[bool] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = 25.0,
    skip: int = Query(0, ge=0),
    limit: int = Query(40, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Listing).filter(Listing.status == ListingStatus.APPROVED)

    if q:
        filter_terms = or_(
            Listing.title.ilike(f"%{q}%"),
            Listing.description.ilike(f"%{q}%"),
            Listing.category.ilike(f"%{q}%"),
            Listing.subcategory.ilike(f"%{q}%"),
            Listing.location.ilike(f"%{q}%")
        )
        query = query.filter(filter_terms)

    if category and category != "All":
        query = query.filter(Listing.category == category)
    if subcategory:
        query = query.filter(Listing.subcategory == subcategory)
    if min_price is not None:
        query = query.filter(Listing.price_per_day >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_day <= max_price)
    if condition:
        query = query.filter(Listing.condition == condition)
    if min_rating is not None:
        query = query.filter(Listing.rating >= min_rating)
    if delivery is True:
        query = query.filter(Listing.delivery_available == True)
    if pickup is True:
        query = query.filter(Listing.pickup_available == True)
    if verified_only is True:
        query = query.join(User, Listing.owner_id == User.id).filter(User.is_verified == True)

    results = query.all()

    # Geo-distance radius filtering if coordinates provided
    if lat is not None and lng is not None and radius_km:
        filtered = []
        for item in results:
            dist = AIEngine.calculate_distance(lat, lng, item.latitude, item.longitude)
            if dist <= radius_km:
                filtered.append(item)
        results = filtered

    return results[skip : skip + limit]

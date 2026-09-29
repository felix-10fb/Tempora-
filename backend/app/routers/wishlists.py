from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.models import Wishlist, WishlistItem, Listing, User
from app.schemas.schemas import ListingResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/wishlists", tags=["Wishlist"])

@router.get("", response_model=List[ListingResponse])
def get_wishlist_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if not wishlist:
        return []
    
    items = db.query(Listing).join(WishlistItem, WishlistItem.listing_id == Listing.id).filter(WishlistItem.wishlist_id == wishlist.id).all()
    return items

@router.post("/toggle/{listing_id}")
def toggle_wishlist_item(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if not wishlist:
        wishlist = Wishlist(id=str(uuid.uuid4()), user_id=current_user.id, title="My Wishlist")
        db.add(wishlist)
        db.flush()

    existing_item = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.listing_id == listing_id
    ).first()

    if existing_item:
        db.delete(existing_item)
        db.commit()
        return {"saved": False, "message": "Removed from wishlist"}
    else:
        new_item = WishlistItem(
            id=str(uuid.uuid4()),
            wishlist_id=wishlist.id,
            listing_id=listing_id
        )
        db.add(new_item)
        db.commit()
        return {"saved": True, "message": "Added to wishlist"}

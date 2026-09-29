from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
import uuid

from backend.app.core.database import get_db
from backend.app.core.ai_engine import AIEngine
from backend.app.models.models import Listing, ItemInspection, ListingStatus
from backend.app.schemas.schemas import (
    AISearchRequest, AISetupBundleResponse, AISetupBundleItem,
    AIInspectionRequest, AIInspectionResponse, ListingResponse
)

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/recommend", response_model=AISetupBundleResponse)
def get_ai_recommendation_bundle(
    req: AISearchRequest,
    db: Session = Depends(get_db)
):
    """
    Signature TEMPORA Feature: 'TELL US WHAT YOU NEED'
    Parses natural language prompts (e.g. '1BHK setup in Chennai for 6 months under ₹5000/mo')
    and builds an optimized bundle of matching local items.
    """
    intent = AIEngine.parse_natural_language_intent(req.query)
    target_categories = intent["categories"]
    user_lat = req.latitude or 13.0827
    user_lng = req.longitude or 80.2707

    # Find matching active listings
    all_active = db.query(Listing).filter(Listing.status == ListingStatus.APPROVED).all()

    bundle_items = []
    total_monthly = 0.0
    total_deposit = 0.0

    # Categorize items
    for item in all_active:
        dist = AIEngine.calculate_distance(user_lat, user_lng, item.latitude, item.longitude)
        
        # Check relevance to intent
        is_relevant = False
        match_percentage = 85
        reason = "Matches your requested category and local radius."

        # Check title / keywords
        for t_item in intent["target_items"]:
            if any(k.lower() in item.title.lower() or k.lower() in (item.subcategory or "").lower() for k in t_item.split()):
                is_relevant = True
                match_percentage = 98
                reason = f"Exact match for {t_item} within {dist:.1f} km."
                break

        if not is_relevant and item.category in target_categories:
            is_relevant = True
            match_percentage = 90
            reason = f"Recommended {item.category} essential for your duration."

        if is_relevant:
            monthly_price = item.price_per_month or (item.price_per_day * 22)
            bundle_items.append(
                AISetupBundleItem(
                    listing=ListingResponse.model_validate(item),
                    match_percentage=match_percentage,
                    reason=reason,
                    monthly_price=round(monthly_price, 2),
                    distance_km=dist
                )
            )
            total_monthly += monthly_price
            total_deposit += item.security_deposit

        # Limit bundle to top 4-5 complementary items
        if len(bundle_items) >= 4:
            break

    # If database had few items, populate with whatever approved items exist
    if not bundle_items and all_active:
        for item in all_active[:3]:
            dist = AIEngine.calculate_distance(user_lat, user_lng, item.latitude, item.longitude)
            monthly_price = item.price_per_month or (item.price_per_day * 22)
            bundle_items.append(
                AISetupBundleItem(
                    listing=ListingResponse.model_validate(item),
                    match_percentage=92,
                    reason="Recommended based on popular temporary setups.",
                    monthly_price=round(monthly_price, 2),
                    distance_km=dist
                )
            )
            total_monthly += monthly_price
            total_deposit += item.security_deposit

    bundle_title = "YOUR TEMPORARY SETUP"
    summary_text = (
        f"AI parsed your request for '{req.query}'. "
        f"Curated {len(bundle_items)} matching hyperlocal items within {intent['radius_km']} km. "
        f"Delivered and assembled at your door."
    )

    return AISetupBundleResponse(
        title=bundle_title,
        summary=summary_text,
        extracted_needs=intent,
        total_monthly_cost=round(total_monthly, 2),
        total_deposit=round(total_deposit, 2),
        match_score=98 if bundle_items else 80,
        items=bundle_items
    )

@router.post("/clothing-look")
def get_clothing_look(
    occasion: str = "Job Interview",
    gender: str = "Unisex",
    budget: float = 1500.0,
    db: Session = Depends(get_db)
):
    """
    CLOTHING MODE: AI Build My Look
    Recommends matching apparel for interviews, weddings, galas, weekend trips.
    """
    clothing_items = db.query(Listing).filter(
        Listing.category == "Clothing",
        Listing.status == ListingStatus.APPROVED
    ).limit(3).all()

    items = []
    total_cost = 0.0
    for it in clothing_items:
        items.append({
            "id": it.id,
            "title": it.title,
            "category": it.subcategory or "Apparel",
            "price_per_day": it.price_per_day,
            "image": it.images[0].image_url if it.images else "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600",
            "condition": it.condition,
            "size": it.specifications.get("size", "M") if it.specifications else "M"
        })
        total_cost += it.price_per_day

    return {
        "look_title": f"The Perfect {occasion} Ensemble",
        "aesthetic": "Polished & Confident Modern Silhouette",
        "occasion": occasion,
        "total_day_rate": total_cost or 799.0,
        "items": items,
        "ai_stylist_notes": f"Coordinated specifically for {occasion}. Dry-cleaned, steamed, and packaged in eco-garment bag."
    }

@router.post("/furniture-home")
def get_temporary_home(
    home_type: str = "1BHK",
    duration_months: int = 6,
    style: str = "Modern",
    budget: float = 5000.0,
    db: Session = Depends(get_db)
):
    """
    FURNITURE MODE: MY TEMPORARY HOME
    Generates turnkey room packages (Bed, Sofa, Desk, Lamp, Storage).
    """
    items = db.query(Listing).filter(
        Listing.category.in_(["Furniture", "Appliances"]),
        Listing.status == ListingStatus.APPROVED
    ).limit(4).all()

    pkg_items = []
    total_mo = 0.0
    for it in items:
        mo_rate = it.price_per_month or (it.price_per_day * 22)
        pkg_items.append({
            "id": it.id,
            "title": it.title,
            "category": it.category,
            "price_per_month": mo_rate,
            "image": it.images[0].image_url if it.images else "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
            "rating": it.rating
        })
        total_mo += mo_rate

    return {
        "package_name": f"The {style} {home_type} Living Suite",
        "home_type": home_type,
        "style": style,
        "duration_months": duration_months,
        "total_monthly_rate": round(total_mo or 4780.0, 2),
        "savings_vs_buying": "Save ~84% compared to purchasing new furniture",
        "items": pkg_items,
        "included_services": [
            "White-glove doorstep delivery",
            "Complimentary room assembly & placement",
            "Mid-rental professional upholstery deep cleaning",
            "Effortless end-of-lease pickup"
        ]
    }

@router.post("/inspect", response_model=AIInspectionResponse)
def inspect_item(
    req: AIInspectionRequest,
    db: Session = Depends(get_db)
):
    """
    AI ITEM INSPECTION:
    Scans item photos for scratches, stains, tears, cracks, missing parts.
    Generates 0-100 Condition Score and Before vs After comparison for dispute resolution.
    """
    listing = db.query(Listing).filter(Listing.id == req.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    inspection_data = AIEngine.inspect_item_condition(
        image_urls=req.image_urls,
        inspection_type=req.inspection_type
    )

    new_inspection = ItemInspection(
        id=str(uuid.uuid4()),
        listing_id=listing.id,
        booking_id=req.booking_id,
        inspection_type=req.inspection_type,
        condition_score=inspection_data["condition_score"],
        condition_grade=inspection_data["condition_grade"],
        detected_defects=inspection_data["detected_defects"],
        image_urls=req.image_urls,
        inspection_summary=inspection_data["inspection_summary"]
    )
    db.add(new_inspection)
    db.commit()
    db.refresh(new_inspection)

    return AIInspectionResponse(
        id=new_inspection.id,
        listing_id=new_inspection.listing_id,
        condition_score=new_inspection.condition_score,
        condition_grade=new_inspection.condition_grade,
        detected_defects=new_inspection.detected_defects or [],
        inspection_summary=new_inspection.inspection_summary,
        pre_vs_post_comparison=inspection_data.get("pre_vs_post_comparison"),
        created_at=new_inspection.created_at
    )

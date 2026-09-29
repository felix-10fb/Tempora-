from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from backend.app.core.ai_engine import AIEngine
from backend.app.core.config import settings
from backend.app.schemas.schemas import DeliveryCalculateRequest, DeliveryCalculateResponse

router = APIRouter(prefix="/maps", tags=["Maps & Delivery"])

@router.post("/calculate-delivery", response_model=DeliveryCalculateResponse)
def calculate_delivery(req: DeliveryCalculateRequest):
    dist_km = AIEngine.calculate_distance(req.pickup_lat, req.pickup_lng, req.drop_lat, req.drop_lng)
    
    # Calculate estimated fee
    fee = settings.MIN_DELIVERY_FEE + (dist_km * settings.BASE_DELIVERY_PER_KM)
    
    # Estimate time (e.g. average city speed 25 km/h + 15 min dispatch)
    estimated_mins = int(15 + (dist_km / 25.0 * 60))

    return DeliveryCalculateResponse(
        distance_km=dist_km,
        estimated_minutes=max(20, estimated_mins),
        estimated_fee=round(fee, 2),
        carrier="Tempora Hyperlocal Express Fleet"
    )

@router.get("/config")
def get_map_config():
    """Returns safe frontend map configuration"""
    return {
        "default_center": {"lat": 13.0827, "lng": 80.2707},
        "default_zoom": 12,
        "city": "Chennai",
        "has_api_key": bool(settings.GOOGLE_MAPS_API_KEY)
    }

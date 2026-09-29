from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from backend.app.core.ai_engine import AIEngine
from backend.app.core.config import settings
from backend.app.schemas.schemas import DeliveryCalculateRequest, DeliveryCalculateResponse

router = APIRouter(prefix="/maps", tags=["Maps & Delivery"])

# Comprehensive Tamil Nadu Pincodes Database with Coordinates
TAMIL_NADU_PINCODES = [
    # Chennai District
    {"pincode": "600001", "area": "George Town / Parrys", "district": "Chennai", "lat": 13.0903, "lng": 80.2882},
    {"pincode": "600002", "area": "Anna Salai / Mount Road", "district": "Chennai", "lat": 13.0673, "lng": 80.2707},
    {"pincode": "600004", "area": "Mylapore", "district": "Chennai", "lat": 13.0368, "lng": 80.2676},
    {"pincode": "600006", "area": "Nungambakkam / Greams Road", "district": "Chennai", "lat": 13.0626, "lng": 80.2425},
    {"pincode": "600017", "area": "T. Nagar (Thyagaraya Nagar)", "district": "Chennai", "lat": 13.0418, "lng": 80.2341},
    {"pincode": "600018", "area": "Alwarpet / Teynampet", "district": "Chennai", "lat": 13.0336, "lng": 80.2497},
    {"pincode": "600020", "area": "Adyar / Gandhinagar", "district": "Chennai", "lat": 13.0012, "lng": 80.2565},
    {"pincode": "600028", "area": "R.A. Puram", "district": "Chennai", "lat": 13.0232, "lng": 80.2589},
    {"pincode": "600040", "area": "Anna Nagar", "district": "Chennai", "lat": 13.0850, "lng": 80.2101},
    {"pincode": "600041", "area": "Thiruvanmiyur / Valmiki Nagar", "district": "Chennai", "lat": 12.9830, "lng": 80.2594},
    {"pincode": "600042", "area": "Velachery", "district": "Chennai", "lat": 12.9815, "lng": 80.2180},
    {"pincode": "600045", "area": "Tambaram", "district": "Chengalpattu", "lat": 12.9249, "lng": 80.1000},
    {"pincode": "600078", "area": "K.K. Nagar", "district": "Chennai", "lat": 13.0410, "lng": 80.1994},
    {"pincode": "600083", "area": "Ashok Nagar", "district": "Chennai", "lat": 13.0354, "lng": 80.2117},
    {"pincode": "600085", "area": "Kotturpuram", "district": "Chennai", "lat": 13.0180, "lng": 80.2415},
    {"pincode": "600090", "area": "Besant Nagar", "district": "Chennai", "lat": 12.9996, "lng": 80.2705},
    {"pincode": "600096", "area": "Perungudi / OMR IT Corridor", "district": "Chennai", "lat": 12.9654, "lng": 80.2461},
    {"pincode": "600097", "area": "Thoraipakkam / OMR", "district": "Chennai", "lat": 12.9344, "lng": 80.2312},
    {"pincode": "600100", "area": "Medavakkam", "district": "Chennai", "lat": 12.9200, "lng": 80.1900},
    {"pincode": "600119", "area": "Sholinganallur", "district": "Chennai", "lat": 12.9010, "lng": 80.2279},
    {"pincode": "600102", "area": "Anna Nagar West", "district": "Chennai", "lat": 13.0910, "lng": 80.2010},

    # Coimbatore District
    {"pincode": "641001", "area": "Coimbatore Main / Town Hall", "district": "Coimbatore", "lat": 11.0018, "lng": 76.9628},
    {"pincode": "641002", "area": "R.S. Puram", "district": "Coimbatore", "lat": 11.0117, "lng": 76.9482},
    {"pincode": "641012", "area": "Gandhipuram", "district": "Coimbatore", "lat": 11.0168, "lng": 76.9674},
    {"pincode": "641004", "area": "Peelamedu", "district": "Coimbatore", "lat": 11.0256, "lng": 77.0125},
    {"pincode": "641018", "area": "Race Course", "district": "Coimbatore", "lat": 11.0064, "lng": 76.9748},
    {"pincode": "641035", "area": "Saravanampatti (IT Park)", "district": "Coimbatore", "lat": 11.0805, "lng": 76.9959},

    # Madurai District
    {"pincode": "625001", "area": "Madurai Central / Meenakshi Temple", "district": "Madurai", "lat": 9.9195, "lng": 78.1193},
    {"pincode": "625020", "area": "Anna Nagar", "district": "Madurai", "lat": 9.9252, "lng": 78.1458},
    {"pincode": "625016", "area": "KK Nagar", "district": "Madurai", "lat": 9.9310, "lng": 78.1520},

    # Tiruchirappalli (Trichy)
    {"pincode": "620001", "area": "Trichy Junction / Cantonment", "district": "Tiruchirappalli", "lat": 10.7905, "lng": 78.6924},
    {"pincode": "620018", "area": "Thillai Nagar", "district": "Tiruchirappalli", "lat": 10.8286, "lng": 78.6853},
    {"pincode": "620006", "area": "Srirangam", "district": "Tiruchirappalli", "lat": 10.8624, "lng": 78.6934},

    # Salem District
    {"pincode": "636001", "area": "Salem City / Town", "district": "Salem", "lat": 11.6643, "lng": 78.1460},
    {"pincode": "636016", "area": "Fairlands", "district": "Salem", "lat": 11.6778, "lng": 78.1415},
    {"pincode": "636007", "area": "Hasthampatti", "district": "Salem", "lat": 11.6840, "lng": 78.1630},

    # Tirunelveli District
    {"pincode": "627001", "area": "Tirunelveli Town", "district": "Tirunelveli", "lat": 8.7303, "lng": 77.7011},
    {"pincode": "627002", "area": "Palayamkottai", "district": "Tirunelveli", "lat": 8.7180, "lng": 77.7330},

    # Vellore District
    {"pincode": "632001", "area": "Vellore Fort / City", "district": "Vellore", "lat": 12.9202, "lng": 79.1333},
    {"pincode": "632014", "area": "Katpadi (VIT Zone)", "district": "Vellore", "lat": 12.9698, "lng": 79.1384},

    # Kanchipuram & Chengalpattu
    {"pincode": "631501", "area": "Kanchipuram Silk City", "district": "Kanchipuram", "lat": 12.8342, "lng": 79.7036},
    {"pincode": "603001", "area": "Chengalpattu Junction", "district": "Chengalpattu", "lat": 12.6922, "lng": 79.9754}
]

class NavigationRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float

@router.get("/pincodes/tn")
def get_tamil_nadu_pincodes(query: Optional[str] = None, district: Optional[str] = None):
    """
    Returns Tamil Nadu pincodes, districts, and coordinates for map navigation and filtering.
    """
    results = TAMIL_NADU_PINCODES
    if district:
        results = [p for p in results if p["district"].lower() == district.lower()]
    if query:
        q = query.lower()
        results = [
            p for p in results
            if q in p["pincode"] or q in p["area"].lower() or q in p["district"].lower()
        ]
    return results

@router.post("/navigate")
def get_navigation_route(req: NavigationRequest):
    """
    Generates turn-by-turn road navigation route between two coordinates in Tamil Nadu.
    Calculates distance, ETA, and interpolated map waypoints.
    """
    dist_km = AIEngine.calculate_distance(req.origin_lat, req.origin_lng, req.dest_lat, req.dest_lng)
    eta_mins = max(10, int(12 + (dist_km / 28.0 * 60)))

    # Generate realistic road waypoints between origin and destination
    steps_count = 5
    waypoints = []
    for i in range(steps_count + 1):
        ratio = i / float(steps_count)
        # Slight arc simulating arterial roads
        offset = 0.003 * (1 - abs(ratio - 0.5) * 2)
        wpt_lat = req.origin_lat + (req.dest_lat - req.origin_lat) * ratio + offset
        wpt_lng = req.origin_lng + (req.dest_lng - req.origin_lng) * ratio - offset
        waypoints.append({"lat": round(wpt_lat, 5), "lng": round(wpt_lng, 5)})

    directions = [
        f"Head toward arterial connector from origin ({dist_km * 0.15:.1f} km)",
        f"Merge onto Main Expressway / Ring Road ({dist_km * 0.6:.1f} km)",
        f"Take designated neighborhood exit toward destination area ({dist_km * 0.2:.1f} km)",
        "Arrive at destination doorstep. Verified handover & AI condition inspection."
    ]

    return {
        "distance_km": dist_km,
        "eta_minutes": eta_mins,
        "traffic_condition": "Moderate Flow (Normal Transit)",
        "waypoints": waypoints,
        "directions": directions
    }

@router.post("/calculate-delivery", response_model=DeliveryCalculateResponse)
def calculate_delivery(req: DeliveryCalculateRequest):
    dist_km = AIEngine.calculate_distance(req.pickup_lat, req.pickup_lng, req.drop_lat, req.drop_lng)
    fee = settings.MIN_DELIVERY_FEE + (dist_km * settings.BASE_DELIVERY_PER_KM)
    estimated_mins = int(15 + (dist_km / 25.0 * 60))

    return DeliveryCalculateResponse(
        distance_km=dist_km,
        estimated_minutes=max(20, estimated_mins),
        estimated_fee=round(fee, 2),
        carrier="Tempora Hyperlocal Express Fleet"
    )

@router.get("/config")
def get_map_config():
    return {
        "default_center": {"lat": 13.0827, "lng": 80.2707},
        "default_zoom": 12,
        "state": "Tamil Nadu",
        "city": "Chennai",
        "has_api_key": bool(settings.GOOGLE_MAPS_API_KEY)
    }

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# ----------------- Auth & User Schemas -----------------
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: str
    email: str
    role: str
    exp: int

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    role: Optional[str] = "CUSTOMER"

class GoogleAuthRequest(BaseModel):
    credential: str # Google ID token or authorization code
    email: Optional[str] = None
    name: Optional[str] = None
    profile_image: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    profile_image: Optional[str] = None
    is_verified: bool
    is_active: bool
    trust_score: int
    bio: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None

class UserPreferenceSchema(BaseModel):
    preferred_categories: List[str] = []
    preferred_radius: float = 15.0
    preferred_budget: float = 10000.0
    preferred_style: str = "Modern"
    preferred_language: str = "English"
    notification_preferences: Dict[str, bool] = {"email": True, "sms": True, "push": True}

# ----------------- Listing Schemas -----------------
class ListingImageSchema(BaseModel):
    id: Optional[str] = None
    image_url: str
    sort_order: int = 0

    model_config = ConfigDict(from_attributes=True)

class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: str
    subcategory: Optional[str] = None
    condition: str = "Excellent"
    price_per_day: float = Field(..., gt=0)
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    security_deposit: float = 0.0
    location: str
    city: str = "Chennai"
    latitude: float
    longitude: float
    rules: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    delivery_available: bool = True
    pickup_available: bool = True
    images: List[str] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    condition: Optional[str] = None
    price_per_day: Optional[float] = None
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    security_deposit: Optional[float] = None
    location: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    rules: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    delivery_available: Optional[bool] = None
    pickup_available: Optional[bool] = None
    images: Optional[List[str]] = None

class ListingResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    condition: str
    price_per_day: float
    price_per_week: Optional[float] = None
    price_per_month: Optional[float] = None
    security_deposit: float
    location: str
    city: str
    latitude: float
    longitude: float
    status: str
    verification_status: str
    rules: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    delivery_available: bool
    pickup_available: bool
    rating: float
    review_count: int
    images: List[ListingImageSchema] = []
    owner: Optional[UserResponse] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Booking Schemas -----------------
class BookingCreate(BaseModel):
    listing_id: str
    start_date: datetime
    end_date: datetime
    delivery_type: str = "DELIVERY" # DELIVERY or PICKUP
    delivery_address: Optional[str] = None
    coupon_code: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    listing_id: str
    renter_id: str
    owner_id: str
    start_date: datetime
    end_date: datetime
    rental_days: int
    rental_amount: float
    delivery_fee: float
    protection_fee: float
    security_deposit: float
    platform_fee: float
    total_amount: float
    delivery_type: str
    delivery_address: Optional[str] = None
    status: str
    payment_status: str
    created_at: Optional[datetime] = None
    listing: Optional[ListingResponse] = None
    renter: Optional[UserResponse] = None
    owner: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Payment Schemas -----------------
class PaymentCreate(BaseModel):
    booking_id: str
    payment_method: str = "card"
    token: Optional[str] = None

class PaymentResponse(BaseModel):
    id: str
    booking_id: str
    amount: float
    transaction_id: str
    payment_provider: str
    status: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Review Schemas -----------------
class ReviewCreate(BaseModel):
    booking_id: Optional[str] = None
    listing_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5)

class ReviewResponse(BaseModel):
    id: str
    booking_id: Optional[str] = None
    reviewer_id: str
    reviewee_id: Optional[str] = None
    listing_id: str
    rating: int
    comment: str
    created_at: Optional[datetime] = None
    reviewer: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- AI Schemas -----------------
class AISearchRequest(BaseModel):
    query: str
    latitude: Optional[float] = 13.0827 # Chennai default
    longitude: Optional[float] = 80.2707
    max_budget: Optional[float] = None
    duration_months: Optional[int] = None

class AISetupBundleItem(BaseModel):
    listing: ListingResponse
    match_percentage: int
    reason: str
    monthly_price: float
    distance_km: float

class AISetupBundleResponse(BaseModel):
    title: str
    summary: str
    extracted_needs: Dict[str, Any]
    total_monthly_cost: float
    total_deposit: float
    match_score: int
    items: List[AISetupBundleItem]

class AIInspectionRequest(BaseModel):
    listing_id: str
    image_urls: List[str]
    inspection_type: str = "PRE_RENTAL" # PRE_RENTAL or POST_RENTAL
    booking_id: Optional[str] = None

class AIInspectionResponse(BaseModel):
    id: str
    listing_id: str
    condition_score: int
    condition_grade: str
    detected_defects: List[Dict[str, Any]]
    inspection_summary: str
    pre_vs_post_comparison: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

# ----------------- Dispute Schemas -----------------
class DisputeCreate(BaseModel):
    booking_id: str
    reason: str
    description: str
    evidence: List[str] = []

class DisputeUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    resolution: Optional[str] = None

class DisputeResponse(BaseModel):
    id: str
    booking_id: str
    raised_by: str
    reason: str
    description: str
    evidence: List[str] = []
    status: str
    admin_notes: Optional[str] = None
    resolution: Optional[str] = None
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    booking: Optional[BookingResponse] = None
    initiator: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Chat Schemas -----------------
class MessageCreate(BaseModel):
    receiver_id: str
    listing_id: Optional[str] = None
    content: str
    image_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    receiver_id: str
    content: str
    image_url: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None
    sender: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ConversationResponse(BaseModel):
    id: str
    listing_id: Optional[str] = None
    participant1_id: str
    participant2_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    listing: Optional[ListingResponse] = None
    participant1: Optional[UserResponse] = None
    participant2: Optional[UserResponse] = None
    latest_message: Optional[MessageResponse] = None
    unread_count: int = 0

    model_config = ConfigDict(from_attributes=True)

# ----------------- Notification Schemas -----------------
class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ----------------- Delivery Schemas -----------------
class DeliveryCalculateRequest(BaseModel):
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float

class DeliveryCalculateResponse(BaseModel):
    distance_km: float
    estimated_minutes: int
    estimated_fee: float
    carrier: str

# ----------------- Dashboard & Analytics Schemas -----------------
class OwnerDashboardStats(BaseModel):
    total_revenue: float
    active_listings: int
    active_rentals: int
    utilization_rate: float
    average_rating: float
    pending_requests: int
    revenue_chart: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]

class AdminDashboardStats(BaseModel):
    total_users: int
    active_owners: int
    active_listings: int
    active_rentals: int
    total_revenue: float
    pending_verifications: int
    open_disputes: int
    gmv: float
    repeat_customer_rate: float
    dispute_rate: float
    daily_stats: List[Dict[str, Any]]
    category_breakdown: List[Dict[str, Any]]
    location_breakdown: List[Dict[str, Any]]

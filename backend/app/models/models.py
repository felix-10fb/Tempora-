import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, ForeignKey, DateTime, JSON, Enum, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserRole:
    CUSTOMER = "CUSTOMER"
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class ListingStatus:
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"
    REPORTED = "REPORTED"

class BookingStatus:
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    DISPUTED = "DISPUTED"

class PaymentStatus:
    PENDING = "PENDING"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    FAILED = "FAILED"

class DisputeStatus:
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    DISMISSED = "DISMISSED"

# 1. Users
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(25), nullable=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(20), default=UserRole.CUSTOMER, index=True)
    profile_image = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    trust_score = Column(Integer, default=85)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    listings = relationship("Listing", back_populates="owner", foreign_keys="Listing.owner_id")
    renter_bookings = relationship("Booking", back_populates="renter", foreign_keys="Booking.renter_id")
    owner_bookings = relationship("Booking", back_populates="owner", foreign_keys="Booking.owner_id")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    reviews_received = relationship("Review", back_populates="reviewee", foreign_keys="Review.reviewee_id")
    wishlists = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

# 2. User Preferences
class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_categories = Column(JSON, default=list)
    preferred_radius = Column(Float, default=15.0)
    preferred_budget = Column(Float, default=10000.0)
    preferred_style = Column(String(50), default="Modern")
    preferred_language = Column(String(20), default="English")
    notification_preferences = Column(JSON, default=lambda: {"email": True, "sms": True, "push": True})

    user = relationship("User", back_populates="preferences")

# 3. Addresses
class Address(Base):
    __tablename__ = "addresses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    address_line = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    place_id = Column(String(100), nullable=True)
    is_default = Column(Boolean, default=False)

    user = relationship("User", back_populates="addresses")

# 4. Categories
class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)

# 5. Listings
class Listing(Base):
    __tablename__ = "listings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    condition = Column(String(50), default="Excellent")
    price_per_day = Column(Float, nullable=False)
    price_per_week = Column(Float, nullable=True)
    price_per_month = Column(Float, nullable=True, index=True)
    security_deposit = Column(Float, default=0.0)
    location = Column(String(255), nullable=False, index=True)
    city = Column(String(100), default="Chennai", index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    status = Column(String(20), default=ListingStatus.APPROVED, index=True)
    verification_status = Column(String(20), default="VERIFIED")
    rules = Column(Text, nullable=True)
    specifications = Column(JSON, default=dict)
    delivery_available = Column(Boolean, default=True)
    pickup_available = Column(Boolean, default=True)
    rating = Column(Float, default=4.9)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    owner = relationship("User", back_populates="listings", foreign_keys=[owner_id])
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.sort_order")
    availabilities = relationship("Availability", back_populates="listing", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="listing")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    inspections = relationship("ItemInspection", back_populates="listing", cascade="all, delete-orphan")

# 6. Listing Images
class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    listing_id = Column(String(36), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(Text, nullable=False)
    sort_order = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="images")

# 7. Availability
class Availability(Base):
    __tablename__ = "availability"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    listing_id = Column(String(36), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(String(20), default="AVAILABLE")

    listing = relationship("Listing", back_populates="availabilities")

# 8. Bookings
class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    listing_id = Column(String(36), ForeignKey("listings.id", ondelete="RESTRICT"), nullable=False, index=True)
    renter_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    start_date = Column(DateTime, nullable=False, index=True)
    end_date = Column(DateTime, nullable=False, index=True)
    rental_days = Column(Integer, default=1)
    rental_amount = Column(Float, nullable=False)
    delivery_fee = Column(Float, default=0.0)
    protection_fee = Column(Float, default=0.0)
    security_deposit = Column(Float, default=0.0)
    platform_fee = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    delivery_type = Column(String(20), default="DELIVERY") # DELIVERY or PICKUP
    delivery_address = Column(String(255), nullable=True)
    status = Column(String(20), default=BookingStatus.CONFIRMED, index=True)
    payment_status = Column(String(20), default=PaymentStatus.PAID)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="bookings")
    renter = relationship("User", back_populates="renter_bookings", foreign_keys=[renter_id])
    owner = relationship("User", back_populates="owner_bookings", foreign_keys=[owner_id])
    payments = relationship("Payment", back_populates="booking")
    reviews = relationship("Review", back_populates="booking")
    disputes = relationship("Dispute", back_populates="booking")
    delivery_orders = relationship("DeliveryOrder", back_populates="booking")

# 9. Payments
class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_id = Column(String(100), unique=True, nullable=False)
    payment_provider = Column(String(50), default="stripe")
    status = Column(String(20), default=PaymentStatus.PAID)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="payments")

# 10. Reviews
class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reviewee_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    listing_id = Column(String(36), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews_given", foreign_keys=[reviewer_id])
    reviewee = relationship("User", back_populates="reviews_received", foreign_keys=[reviewee_id])
    listing = relationship("Listing", back_populates="reviews")

# 11. Wishlists
class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), default="Dream Setup")
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="wishlists")
    items = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan")

# 12. Wishlist Items
class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wishlist_id = Column(String(36), ForeignKey("wishlists.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(String(36), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    wishlist = relationship("Wishlist", back_populates="items")
    listing = relationship("Listing")

# 13. Conversations
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    listing_id = Column(String(36), ForeignKey("listings.id", ondelete="SET NULL"), nullable=True)
    participant1_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    participant2_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing")
    participant1 = relationship("User", foreign_keys=[participant1_id])
    participant2 = relationship("User", foreign_keys=[participant2_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

# 14. Messages
class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])

# 15. Notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False) # BOOKING, PAYMENT, RETURN, MESSAGE, DISPUTE
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")

# 16. Disputes
class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    raised_by = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(JSON, default=list) # List of image URLs or docs
    status = Column(String(20), default=DisputeStatus.OPEN, index=True)
    admin_notes = Column(Text, nullable=True)
    resolution = Column(String(100), nullable=True) # FULL_REFUND, PARTIAL_REFUND, RELEASE_DEPOSIT, DISMISSED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="disputes")
    initiator = relationship("User", foreign_keys=[raised_by])

# 17. Reports
class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reported_listing_id = Column(String(36), ForeignKey("listings.id", ondelete="CASCADE"), nullable=True)
    reported_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    reason = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# 18. Admin Logs
class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    admin_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. VERIFIED_USER, REFUNDED_BOOKING, SUSPENDED_LISTING
    target_type = Column(String(50), nullable=False) # USER, LISTING, DISPUTE, BOOKING
    target_id = Column(String(36), nullable=False)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# 19. Subscriptions
class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_name = Column(String(50), default="PRO_OWNER")
    status = Column(String(20), default="ACTIVE")
    start_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    end_date = Column(DateTime, nullable=True)
    price = Column(Float, default=499.0)

# 20. Coupons
class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(30), unique=True, nullable=False)
    discount_percentage = Column(Float, default=10.0)
    max_discount = Column(Float, default=500.0)
    valid_until = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

# 21. Delivery Orders
class DeliveryOrder(Base):
    __tablename__ = "delivery_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    pickup_address = Column(String(255), nullable=False)
    delivery_address = Column(String(255), nullable=False)
    distance_km = Column(Float, default=3.5)
    estimated_minutes = Column(Integer, default=45)
    tracking_status = Column(String(50), default="SCHEDULED") # SCHEDULED, DISPATCHED, IN_TRANSIT, DELIVERED
    carrier_name = Column(String(100), default="Tempora Express Fleet")
    tracking_code = Column(String(100), default=lambda: f"TMP-TRK-{uuid.uuid4().hex[:8].upper()}")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    booking = relationship("Booking", back_populates="delivery_orders")

# 22. AI Item Inspection (Condition Scoring & Defect Detection)
class ItemInspection(Base):
    __tablename__ = "item_inspections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    listing_id = Column(String(36), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    inspection_type = Column(String(30), default="PRE_RENTAL") # PRE_RENTAL or POST_RENTAL
    condition_score = Column(Integer, default=94) # 0 to 100
    condition_grade = Column(String(30), default="Very Good") # Pristine, Very Good, Good, Fair, Damaged
    detected_defects = Column(JSON, default=list) # e.g. [{"type": "scratch", "severity": "minor", "location": "bottom edge"}]
    image_urls = Column(JSON, default=list)
    inspection_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="inspections")

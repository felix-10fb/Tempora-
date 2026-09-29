from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.models.models import (
    Booking, Listing, User, Notification, BookingStatus, PaymentStatus, DeliveryOrder
)
from app.schemas.schemas import BookingCreate, BookingResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse)
def create_booking(
    data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot rent your own listing")

    # Calculate days
    start = data.start_date.replace(tzinfo=timezone.utc) if data.start_date.tzinfo is None else data.start_date
    end = data.end_date.replace(tzinfo=timezone.utc) if data.end_date.tzinfo is None else data.end_date

    delta_days = max(1, (end - start).days)

    # Calculate rental amount
    if delta_days >= 30 and listing.price_per_month:
        months = delta_days / 30.0
        rental_amount = round(months * listing.price_per_month, 2)
    elif delta_days >= 7 and listing.price_per_week:
        weeks = delta_days / 7.0
        rental_amount = round(weeks * listing.price_per_week, 2)
    else:
        rental_amount = round(delta_days * listing.price_per_day, 2)

    delivery_fee = 149.0 if data.delivery_type == "DELIVERY" else 0.0
    protection_fee = round(rental_amount * settings.PROTECTION_FEE_PERCENTAGE, 2)
    platform_fee = round(rental_amount * settings.PLATFORM_FEE_PERCENTAGE, 2)
    security_deposit = listing.security_deposit or 0.0

    total_amount = round(rental_amount + delivery_fee + protection_fee + platform_fee + security_deposit, 2)

    new_booking = Booking(
        id=str(uuid.uuid4()),
        listing_id=listing.id,
        renter_id=current_user.id,
        owner_id=listing.owner_id,
        start_date=start,
        end_date=end,
        rental_days=delta_days,
        rental_amount=rental_amount,
        delivery_fee=delivery_fee,
        protection_fee=protection_fee,
        security_deposit=security_deposit,
        platform_fee=platform_fee,
        total_amount=total_amount,
        delivery_type=data.delivery_type,
        delivery_address=data.delivery_address or "Selected on checkout",
        status=BookingStatus.CONFIRMED,
        payment_status=PaymentStatus.PAID
    )
    db.add(new_booking)
    db.flush()

    # If delivery selected, create delivery order
    if data.delivery_type == "DELIVERY":
        delivery_order = DeliveryOrder(
            id=str(uuid.uuid4()),
            booking_id=new_booking.id,
            pickup_address=listing.location,
            delivery_address=data.delivery_address or "Customer Destination",
            distance_km=4.8,
            estimated_minutes=40,
            tracking_status="SCHEDULED"
        )
        db.add(delivery_order)

    # Add notifications
    renter_notif = Notification(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type="BOOKING_CONFIRMED",
        title="Booking Confirmed!",
        message=f"Your rental for '{listing.title}' is confirmed. Total: ₹{total_amount:,.2f}",
        link=f"/dashboard?tab=rentals"
    )
    owner_notif = Notification(
        id=str(uuid.uuid4()),
        user_id=listing.owner_id,
        type="NEW_RENTAL_REQUEST",
        title="New Rental Confirmed!",
        message=f"{current_user.name} booked '{listing.title}' for {delta_days} days.",
        link=f"/owner?tab=rentals"
    )
    db.add(renter_notif)
    db.add(owner_notif)

    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.get("", response_model=list[BookingResponse])
def get_user_bookings(
    role: str = "renter", # renter or owner
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if role == "owner":
        bookings = db.query(Booking).filter(Booking.owner_id == current_user.id).order_by(Booking.created_at.desc()).all()
    else:
        bookings = db.query(Booking).filter(Booking.renter_id == current_user.id).order_by(Booking.created_at.desc()).all()
    return bookings

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_by_id(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.renter_id != current_user.id and booking.owner_id != current_user.id and current_user.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")
    return booking

@router.put("/{booking_id}/status", response_model=BookingResponse)
def update_booking_status(
    booking_id: str,
    new_status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = new_status
    db.commit()
    db.refresh(booking)
    return booking

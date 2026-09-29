from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from backend.app.core.database import get_db
from backend.app.models.models import Payment, Booking, PaymentStatus, BookingStatus, User
from backend.app.schemas.schemas import PaymentCreate, PaymentResponse
from backend.app.routers.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("", response_model=PaymentResponse)
def process_payment(
    data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.renter_id != current_user.id and current_user.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    new_payment = Payment(
        id=str(uuid.uuid4()),
        booking_id=booking.id,
        user_id=current_user.id,
        amount=booking.total_amount,
        transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
        payment_provider="stripe",
        status=PaymentStatus.PAID
    )
    db.add(new_payment)
    booking.payment_status = PaymentStatus.PAID
    booking.status = BookingStatus.CONFIRMED

    db.commit()
    db.refresh(new_payment)
    return new_payment

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
import uuid

from app.core.database import get_db
from app.models.models import Conversation, Message, User, Listing
from app.schemas.schemas import (
    MessageCreate, MessageResponse, ConversationResponse
)
from app.routers.auth import get_current_user

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.get("/conversations", response_model=List[ConversationResponse])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = db.query(Conversation).filter(
        or_(
            Conversation.participant1_id == current_user.id,
            Conversation.participant2_id == current_user.id
        )
    ).order_by(Conversation.updated_at.desc()).all()

    result = []
    for c in convs:
        latest = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.created_at.desc()).first()
        unread = db.query(Message).filter(
            Message.conversation_id == c.id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()

        conv_dict = {
            "id": c.id,
            "listing_id": c.listing_id,
            "participant1_id": c.participant1_id,
            "participant2_id": c.participant2_id,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "listing": c.listing,
            "participant1": c.participant1,
            "participant2": c.participant2,
            "latest_message": latest,
            "unread_count": unread
        }
        result.append(conv_dict)

    return result

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conv.participant1_id != current_user.id and conv.participant2_id != current_user.id and current_user.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Mark unread messages as read
    db.query(Message).filter(
        Message.conversation_id == conv.id,
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    return messages

@router.post("/messages", response_model=MessageResponse)
def send_message(
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient user not found")

    # Find or create conversation
    conv = db.query(Conversation).filter(
        or_(
            and_(Conversation.participant1_id == current_user.id, Conversation.participant2_id == receiver.id),
            and_(Conversation.participant1_id == receiver.id, Conversation.participant2_id == current_user.id)
        )
    ).first()

    if not conv:
        conv = Conversation(
            id=str(uuid.uuid4()),
            listing_id=data.listing_id,
            participant1_id=current_user.id,
            participant2_id=receiver.id
        )
        db.add(conv)
        db.flush()

    new_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=conv.id,
        sender_id=current_user.id,
        receiver_id=receiver.id,
        content=data.content,
        image_url=data.image_url,
        is_read=False
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

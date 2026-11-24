from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Conversation, Message, User
from schemas import (
    ConversationOut,
    MessageIn,
    MessageOut,
    StartConversationIn,
    ThreadOut,
)

router = APIRouter(tags=["messages"])


def get_my_conversation(db: Session, conversation_id: int, me: User) -> Conversation:
    conv = db.get(Conversation, conversation_id)
    # Same 404 whether it doesn't exist or isn't yours, so ids can't be probed
    if conv is None or me.id not in (conv.user_a_id, conv.user_b_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


def other_user_id(conv: Conversation, me: User) -> int:
    return conv.user_b_id if conv.user_a_id == me.id else conv.user_a_id


@router.get("/conversations", response_model=list[ConversationOut])
def inbox(db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    convs = db.scalars(
        select(Conversation).where(or_(Conversation.user_a_id == me.id, Conversation.user_b_id == me.id))
    ).all()
    if not convs:
        return []

    ids = [c.id for c in convs]

    # Latest message id per conversation, then fetch those messages
    last_ids = [
        row[1]
        for row in db.execute(
            select(Message.conversation_id, func.max(Message.id))
            .where(Message.conversation_id.in_(ids))
            .group_by(Message.conversation_id)
        ).all()
    ]
    last = {m.conversation_id: m for m in db.scalars(select(Message).where(Message.id.in_(last_ids)))}

    unread = dict(
        db.execute(
            select(Message.conversation_id, func.count())
            .where(
                Message.conversation_id.in_(ids),
                Message.sender_id != me.id,
                Message.read_at.is_(None),
            )
            .group_by(Message.conversation_id)
        ).all()
    )

    others = {
        u.id: u
        for u in db.scalars(select(User).where(User.id.in_([other_user_id(c, me) for c in convs])))
    }

    result = []
    for c in convs:
        m = last.get(c.id)
        result.append(
            ConversationOut(
                id=c.id,
                user=others[other_user_id(c, me)],
                last_message=m.text if m else None,
                last_message_at=m.created_at if m else None,
                unread_count=unread.get(c.id, 0),
            )
        )
    result.sort(key=lambda r: r.last_message_at or datetime.min, reverse=True)
    return result


@router.post("/conversations")
def start_conversation(
    data: StartConversationIn, db: Session = Depends(get_db), me: User = Depends(get_current_user)
):
    """Open the conversation with another user, creating it if it doesn't exist."""
    if data.user_id == me.id:
        raise HTTPException(status_code=400, detail="You can't message yourself")
    if db.get(User, data.user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")

    a, b = sorted([me.id, data.user_id])
    find = select(Conversation).where(Conversation.user_a_id == a, Conversation.user_b_id == b)
    conv = db.scalar(find)
    if conv is None:
        db.add(Conversation(user_a_id=a, user_b_id=b))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()  # someone created it a moment ago; just fetch it
        conv = db.scalar(find)
    return {"id": conv.id}


@router.get("/conversations/{conversation_id}/messages", response_model=ThreadOut)
def thread(conversation_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    conv = get_my_conversation(db, conversation_id, me)
    other = db.get(User, other_user_id(conv, me))
    messages = db.scalars(
        select(Message).where(Message.conversation_id == conv.id).order_by(Message.created_at, Message.id)
    ).all()
    return ThreadOut(user=other, messages=list(messages))


@router.post("/conversations/{conversation_id}/read")
def mark_read(conversation_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    conv = get_my_conversation(db, conversation_id, me)
    db.execute(
        update(Message)
        .where(Message.conversation_id == conv.id, Message.sender_id != me.id, Message.read_at.is_(None))
        .values(read_at=datetime.utcnow())
    )
    db.commit()
    return {"detail": "ok"}


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut, status_code=201)
def send_message(
    conversation_id: int,
    data: MessageIn,
    db: Session = Depends(get_db),
    me: User = Depends(get_current_user),
):
    conv = get_my_conversation(db, conversation_id, me)
    message = Message(conversation_id=conv.id, sender_id=me.id, text=data.text)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.post("/messages/{message_id}/heart")
def heart_message(message_id: int, db: Session = Depends(get_db), me: User = Depends(get_current_user)):
    message = db.get(Message, message_id)
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    get_my_conversation(db, message.conversation_id, me)  # must be a participant
    message.hearted = not message.hearted
    db.commit()
    return {"hearted": message.hearted}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth import create_token, get_current_user
from database import get_db
from models import User
from schemas import LoginIn, SignupIn, TokenOut, UserOut
from security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def unique_username(db: Session, email: str) -> str:
    base = email.split("@")[0].lower()
    name, n = base, 1
    while db.scalar(select(User).where(User.username == name)):
        n += 1
        name = f"{base}{n}"
    return name


@router.post("/signup", response_model=TokenOut, status_code=201)
def signup(data: SignupIn, db: Session = Depends(get_db)):
    email = data.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(
        full_name=data.full_name.strip(),
        email=email,
        username=unique_username(db, email),
        password_hash=hash_password(data.password),
        avatar_url="https://i.pravatar.cc/150?img=12",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_token(user.id), "user": user}


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower().strip()))
    if user is None or not verify_password(data.password, user.password_hash):
        # Same message for both cases, so attackers can't tell which emails exist
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_token(user.id), "user": user}


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # Tokens are stateless: the frontend logs out by deleting its stored token
    return {"detail": "Logged out"}
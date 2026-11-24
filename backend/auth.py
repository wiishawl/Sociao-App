import os
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database import get_db
from models import User

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-me")  # real secret via env var in production
ALGORITHM = "HS256"
TOKEN_HOURS = 24

bearer = HTTPBearer(auto_error=False)


def create_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=TOKEN_HOURS)
    return jwt.encode({"sub": str(user_id), "exp": expires}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user
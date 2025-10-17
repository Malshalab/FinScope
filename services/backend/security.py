import os
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from .deps import get_db
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from .db.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET", "change-me")
ALGORITHM = os.getenv("JWT_ALG", "HS256")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)

def create_access_token(sub: str, minutes: int = 60) -> str:
    now = datetime.utcnow()
    payload = {"sub": sub, "iat": now, "exp": now + timedelta(minutes=minutes)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str= Depends(oauth2_scheme), db: Session=Depends(get_db)) -> User:
    
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},  # tells clients to send a Bearer token
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exc
        # Your User.id is Integer autoincrement; cast if `sub` was encoded as string
        user_id = int(sub)
    except (JWTError, ValueError):
        # JWT invalid/expired, or `sub` not an int
        raise credentials_exc

    user = db.get(User, user_id)  # SQLAlchemy 2.x way to load by primary key
    if user is None:
        raise credentials_exc

    return user

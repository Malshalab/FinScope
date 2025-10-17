from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db.models import User
from ..deps import get_db
from ..schemas.users import Login, Register, TokenOut
from ..security import create_access_token, hash_password, verify_password


router = APIRouter()

# Login Router
@router.post("/login", response_model=TokenOut)
def login(payload: Login, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="username or password is invalid")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="username or password is invalid")


    token = create_access_token(sub=str(user.id))
    return {"access_token": token, "token_type": "bearer"}


@router.post("/register", response_model=TokenOut)
def register(payload: Register, db: Session = Depends(get_db)):

    userCheck = db.query(User).filter(User.email == payload.email).first()

    if userCheck:
        raise HTTPException(status_code=401, detail="user already exists")

    hashedPassword = hash_password(payload.password)

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hashedPassword
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(sub=str(new_user.id))
    return {"access_token": token, "token_type": "bearer"}

   

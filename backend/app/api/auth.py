from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, UserResponse
from app.core.security import create_access_token
from app.core.dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

password_hash = PasswordHash.recommended()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register", response_model=UserResponse)
def register_user(
    user_data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    hashed_password = password_hash.hash(user_data.password)

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login_user(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == login_data.email)
        .first()
    )

    if not user or not password_hash.verify(
        login_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
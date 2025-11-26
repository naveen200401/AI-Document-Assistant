# backend/app/api/auth.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from app.db.session import async_session
from app.models import User  # adjust to your actual models file
from app.utils import hash_password, verify_password, create_access_token  # adjust/create helpers
from app.models import User
from sqlmodel import select
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter()

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None

class LoginIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/auth/register")
async def register(data: RegisterIn):
    async with async_session() as session:
        q = await session.exec(User.select().where(User.email == data.email))
        existing = q.first()
        if existing:
            raise HTTPException(status_code=400, detail="User exists")
        u = User(email=data.email, hashed_password=hash_password(data.password), name=data.name)
        session.add(u)
        await session.commit()
        await session.refresh(u)
        return {"id": u.id, "email": u.email}

@router.post("/auth/login")
async def login(data: LoginIn):
    async with async_session() as session:
        q = await session.exec(User.select().where(User.email == data.email))
        user = q.first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"user_id": user.id})
        return {"access_token": token, "token_type": "bearer"}

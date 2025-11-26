# app/api/v1/auth.py
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
from app.core import security
import uuid
import os
from datetime import timedelta

router = APIRouter()

# Simple persistent JSON file as naive user store for local dev
USERS_FILE = os.environ.get("USERS_FILE", "/tmp/ai_docs_users.json")

def _read_users():
    try:
        import json
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _write_users(data):
    import json
    with open(USERS_FILE, "w") as f:
        json.dump(data, f, indent=2)

class RegisterIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=UserOut)
def register(payload: RegisterIn):
    users = _read_users()
    if payload.email in users:
        raise HTTPException(status_code=400, detail="User already exists")
    user_id = str(uuid.uuid4())
    hashed = security.hash_password(payload.password)
    users[payload.email] = {"id": user_id, "email": payload.email, "hashed_password": hashed}
    _write_users(users)
    return {"id": user_id, "email": payload.email}

@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn):
    users = _read_users()
    u = users.get(payload.email)
    if not u:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not security.verify_password(payload.password, u["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = security.create_access_token(subject=u["id"], expires_delta=timedelta(hours=6))
    return {"access_token": token, "token_type": "bearer"}

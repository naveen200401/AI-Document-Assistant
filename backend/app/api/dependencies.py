# app/api/dependencies.py
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import settings
from app.db.session import async_session
from app.models import User  # your User model

security = HTTPBearer()  # reads Authorization: Bearer <token>

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    FastAPI dependency to return the currently authenticated user.
    Expects JWT with claim 'user_id' (your tokens use that).
    """
    token = credentials.credentials
    try:
        algo = getattr(settings, "ALGORITHM", "HS256")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[algo])
    except (JWTError, Exception):
        raise credentials_exception

    # try common claim names
    user_id = payload.get("user_id") or payload.get("sub") or payload.get("uid")
    if not user_id:
        raise credentials_exception

    # fetch user from DB (async)
    async with async_session() as session:
        user = await session.get(User, int(user_id))
        if not user:
            raise credentials_exception
        return user

from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str]


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


class ProjectCreate(BaseModel):
    title: str
    doc_type: str        # "docx" or "pptx"
    topic: Optional[str]


class SectionCreate(BaseModel):
    title: str
    order: int

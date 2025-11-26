# app/api/v1/__init__.py
from fastapi import APIRouter

from . import auth, projects, sections  # ensure these modules exist

api_router = APIRouter(prefix="/api/v1")

# include sub-routers (each file should expose `router`)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(sections.router, prefix="/sections", tags=["sections"])

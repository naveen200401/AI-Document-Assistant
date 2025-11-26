from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Async engine for runtime
async_engine = create_async_engine(settings.DATABASE_URL, future=True, echo=True)
async_session = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

# Helper for synchronous operations (e.g., dev migrations)
def get_sync_engine():
    sync_url = settings.DATABASE_URL.replace("+asyncpg", "")
    return create_engine(sync_url, echo=True)

# Initialize DB (creates tables from models) — call this on startup
async def init_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

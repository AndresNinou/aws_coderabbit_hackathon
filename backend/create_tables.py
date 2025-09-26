#!/usr/bin/env python3
"""Script to create database tables for the application."""

import asyncio
from app.core.db import async_session_maker
from app.models import ClaudeSession
from sqlmodel import SQLModel


async def create_tables():
    """Create all database tables."""
    async with async_session_maker() as session:
        # Create tables using SQLAlchemy's async engine
        from app.core.db import engine
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        print("✅ Database tables created successfully!")


if __name__ == "__main__":
    asyncio.run(create_tables())
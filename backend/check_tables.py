#!/usr/bin/env python3
"""Script to check database tables."""

import asyncio
from sqlalchemy import text
from app.core.db import async_session_maker


async def check_tables():
    """Check what tables exist in the database."""
    async with async_session_maker() as session:
        # Check tables
        result = await session.execute(
            text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        )
        tables = result.fetchall()
        print("Tables:", [t[0] for t in tables])

        # Check ClaudeSession table structure if it exists
        if 'ClaudeSession' in [t[0] for t in tables]:
            result = await session.execute(
                text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'ClaudeSession' ORDER BY ordinal_position")
            )
            columns = result.fetchall()
            print("ClaudeSession columns:", columns)


if __name__ == "__main__":
    asyncio.run(check_tables())
"""CRUD operations module for database entities.

Provides Create, Read, Update, Delete functionality for database models.
Follows a functional-first approach with pure functions as specified in the architecture guidelines.
"""

from datetime import datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import ClaudeSession, Page


# Pydantic models for Page operations
class PageCreate(BaseModel):
    """Schema for creating a new page."""

    name: str


class PageUpdate(BaseModel):
    """Schema for updating an existing page."""

    name: str | None = None


class ClaudeSessionCreate(BaseModel):
    """Schema for creating a new Claude session."""

    user_id: str
    session_data: dict[str, Any] | None = None
    working_directory: str | None = None


class ClaudeSessionUpdate(BaseModel):
    """Schema for updating an existing Claude session."""

    session_data: dict[str, Any] | None = None
    working_directory: str | None = None


async def create_page(*, session: AsyncSession, page_in: PageCreate) -> Page:
    """Create a new page in the database.

    Args:
        session: Database session
        page_in: Page creation data

    Returns:
        The created page
    """
    db_page = Page(name=page_in.name)
    session.add(db_page)
    await session.commit()
    await session.refresh(db_page)
    return db_page


async def get_page(*, session: AsyncSession, page_id: int) -> Page | None:
    """Get a page by ID.

    Args:
        session: Database session
        page_id: ID of the page

    Returns:
        The page if found, None otherwise
    """
    return await session.get(Page, page_id)


async def get_pages(*, session: AsyncSession, skip: int = 0, limit: int = 100) -> list[Page]:
    """Get a list of pages with pagination.

    Args:
        session: Database session
        skip: Number of pages to skip
        limit: Maximum number of pages to return

    Returns:
        List of pages
    """
    query = select(Page)
    # Convert Sequence[Page] to list[Page] explicitly for type safety
    result = await session.exec(query.offset(skip).limit(limit))
    pages = result.all()
    return list(pages)


async def update_page(*, session: AsyncSession, db_page: Page, page_in: PageUpdate) -> Page:
    """Update a page.

    Args:
        session: Database session
        db_page: Existing page from the database
        page_in: Update data

    Returns:
        The updated page
    """
    update_data = page_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_page, key, value)
    session.add(db_page)
    await session.commit()
    await session.refresh(db_page)
    return db_page


async def delete_page(*, session: AsyncSession, page_id: int) -> None:
    """Delete a page.

    Args:
        session: Database session
        page_id: ID of the page to delete
    """
    page = await session.get(Page, page_id)
    if page:
        await session.delete(page)
        await session.commit()


async def create_claude_session(*, session: AsyncSession, session_in: ClaudeSessionCreate) -> ClaudeSession:
    """Create a new Claude session in the database.

    Args:
        session: Database session
        session_in: Claude session creation data

    Returns:
        The created Claude session
    """
    db_session = ClaudeSession(
        id=str(uuid4()),
        user_id=session_in.user_id,
        session_data=session_in.session_data,
        working_directory=session_in.working_directory,
    )
    session.add(db_session)
    await session.commit()
    await session.refresh(db_session)
    return db_session


async def get_claude_session(*, session: AsyncSession, session_id: str) -> ClaudeSession | None:
    """Get a Claude session by ID.

    Args:
        session: Database session
        session_id: ID of the Claude session

    Returns:
        The Claude session if found, None otherwise
    """
    return await session.get(ClaudeSession, session_id)


async def get_claude_sessions_by_user(*, session: AsyncSession, user_id: str, skip: int = 0, limit: int = 100) -> list[ClaudeSession]:
    """Get Claude sessions for a user with pagination.

    Args:
        session: Database session
        user_id: User ID
        skip: Number of sessions to skip
        limit: Maximum number of sessions to return

    Returns:
        List of Claude sessions
    """
    query = select(ClaudeSession).where(ClaudeSession.user_id == user_id)
    result = await session.exec(query.offset(skip).limit(limit))
    sessions = result.all()
    return list(sessions)


async def update_claude_session(*, session: AsyncSession, db_session: ClaudeSession, session_in: ClaudeSessionUpdate) -> ClaudeSession:
    """Update a Claude session.

    Args:
        session: Database session
        db_session: Existing Claude session from the database
        session_in: Update data

    Returns:
        The updated Claude session
    """
    update_data = session_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_session, key, value)
    from datetime import timezone
    db_session.updated_at = datetime.now(timezone.utc)
    session.add(db_session)
    await session.commit()
    await session.refresh(db_session)
    return db_session


async def delete_claude_session(*, session: AsyncSession, session_id: str) -> None:
    """Delete a Claude session.

    Args:
        session: Database session
        session_id: ID of the Claude session to delete
    """
    claude_session = await session.get(ClaudeSession, session_id)
    if claude_session:
        await session.delete(claude_session)
        await session.commit()

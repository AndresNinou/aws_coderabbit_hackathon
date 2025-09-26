from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import Column, Integer, PrimaryKeyConstraint, Text, TIMESTAMP, JSON
from sqlmodel import Field, SQLModel


class Page(SQLModel, table=True):
    __tablename__ = 'Page'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='Page_pkey'),
    )

    id: Optional[int] = Field(default=None, sa_column=Column('id', Integer, primary_key=True))
    name: str = Field(sa_column=Column('name', Text))


class ClaudeSession(SQLModel, table=True):
    """Model for Claude conversation sessions.

    Stores session state for multi-turn conversations with Claude Code SDK.
    """

    __tablename__ = 'ClaudeSession'
    __table_args__ = (
        PrimaryKeyConstraint('id', name='ClaudeSession_pkey'),
    )

    id: Optional[str] = Field(default=None, sa_column=Column('id', Text, primary_key=True))
    user_id: str = Field(sa_column=Column('user_id', Text))
    session_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column('session_data', JSON))
    working_directory: Optional[str] = Field(default=None, sa_column=Column('working_directory', Text))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column('created_at', TIMESTAMP))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column('updated_at', TIMESTAMP))

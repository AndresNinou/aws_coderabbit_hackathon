"""Claude Code SDK API routes module.

Provides endpoints for interacting with Claude Code SDK for AI-powered code assistance.
Supports streaming responses and custom tool integration.
"""

from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.api.deps import SessionDep
from app.crud import create_claude_session
from app.utils import query_claude_stream

router = APIRouter(prefix="/claude", tags=["claude"])


class ClaudeQueryRequest(BaseModel):
    """Request model for Claude query endpoint."""

    prompt: str
    user_id: str
    options: dict[str, Any] | None = None
    session_id: str | None = None
    working_directory: str | None = None
    create_directory: bool = False


class ClaudeMessageContent(BaseModel):
    """Content block within a Claude message."""

    type: str
    text: str | None = None
    tool_use_id: str | None = None
    content: Any | None = None
    id: str | None = None
    name: str | None = None
    input: dict[str, Any] | None = None


class ClaudeMessage(BaseModel):
    """Message model for Claude responses."""

    id: str | None = None
    type: str
    content: list[ClaudeMessageContent]
    timestamp: str | None = None
    total_cost_usd: float | None = None
    is_error: bool | None = None


class ClaudeQueryResponse(BaseModel):
    """Response model for Claude query endpoint."""

    messages: list[ClaudeMessage]


@router.post("/query")
async def query_claude_endpoint(request: ClaudeQueryRequest, session: SessionDep):
    """Query Claude Code SDK with streaming response.
    
    Initiates a conversation with Claude Code SDK and streams responses back.
    Supports custom tools, options, and working directory specification via SDK options.
    
    Args:
        request: Query request containing:
            - prompt: The text prompt to send to Claude (required)
            - user_id: User identifier (required)
            - options: Optional ClaudeCodeOptions (system_prompt, max_turns, allowed_tools, etc.)
            - session_id: Optional session identifier for multi-turn conversations
            - working_directory: Optional path for Claude operations (set via options.cwd)
            - create_directory: Whether to create the working directory if it doesn't exist (default: false)
    
    Returns:
        Streaming response with Claude messages in NDJSON format
    
    Raises:
        HTTPException: If Claude SDK query fails or working directory is invalid
    """
    try:
        # Handle session management
        current_session_id = request.session_id
        if not current_session_id:
            # Create new session
            from app.crud import ClaudeSessionCreate
            new_session = await create_claude_session(
                session=session,
                session_in=ClaudeSessionCreate(user_id=request.user_id, state={})
            )
            current_session_id = new_session.id

        # Handle working directory if specified
        cwd = None
        if request.working_directory:
            import os

            # Check if directory exists
            if not os.path.exists(request.working_directory):
                if request.create_directory:
                    # Create directory and all parent directories
                    os.makedirs(request.working_directory, exist_ok=True)
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Working directory '{request.working_directory}' does not exist. "
                                "Set 'create_directory': true to create it automatically."
                    )

            # Verify it's actually a directory
            if not os.path.isdir(request.working_directory):
                raise HTTPException(
                    status_code=400,
                    detail=f"Path '{request.working_directory}' exists but is not a directory."
                )

            cwd = request.working_directory

        # Return streaming response
        headers = {"Cache-Control": "no-cache"}
        if current_session_id:
            headers["X-Session-ID"] = current_session_id
        return StreamingResponse(
            query_claude_stream(request.prompt, request.options, current_session_id, session, cwd),
            media_type="application/x-ndjson",
            headers=headers
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Claude SDK error: {e!s}")


@router.get("/sessions/{session_id}")
async def get_claude_session_endpoint(session_id: str, session: SessionDep):
    """Get Claude session state by ID.

    Retrieves the current state of a Claude conversation session.

    Args:
        session_id: Unique identifier for the Claude session
        session: Database session

    Returns:
        Session state information

    Raises:
        HTTPException: If session not found
    """
    from app.crud import get_claude_session as get_session_crud

    db_session = await get_session_crud(session=session, session_id=session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "id": db_session.id,
        "user_id": db_session.user_id,
        "session_data": db_session.session_data,
        "working_directory": db_session.working_directory,
        "created_at": db_session.created_at,
        "updated_at": db_session.updated_at,
    }
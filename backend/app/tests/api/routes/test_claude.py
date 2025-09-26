"""Integration tests for the Claude Code SDK API routes.

Tests Claude query endpoints including streaming responses and error handling.
Mocks the Claude SDK to avoid requiring actual API keys in tests.
"""

import json
from typing import Any
from unittest.mock import patch

import pytest
from httpx import AsyncClient

from app.core.config import settings


@pytest.mark.asyncio
async def test_query_claude_success(client: AsyncClient) -> None:
    """Test successful Claude query with mocked streaming response."""
    # Mock the Claude SDK functions
    mock_message = {
        "id": "test-msg-1",
        "type": "assistant",
        "content": [{"type": "text", "text": "Hello from Claude!"}],
        "timestamp": "2025-01-01T00:00:00Z",
    }

    with patch("app.utils.query_claude_stream") as mock_stream, \
         patch("app.utils.settings.ANTHROPIC_API_KEY", "test-key"):
        # Mock the async generator
        async def mock_generator():
            yield json.dumps(mock_message) + "\n"
            yield json.dumps({"type": "result", "total_cost_usd": 0.01}) + "\n"

        mock_stream.return_value = mock_generator()

        # Test the endpoint
        data = {"prompt": "What is 2+2?", "options": {"allowed_tools": ["Read"]}}
        response = await client.post(
            f"{settings.API_V1_STR}/claude/query",
            json=data,
        )

        # Should return streaming response
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/x-ndjson"

        # Verify the mock was called with correct parameters
        mock_stream.assert_called_once_with("What is 2+2?", {"allowed_tools": ["Read"]})


@pytest.mark.asyncio
async def test_query_claude_missing_api_key(client: AsyncClient) -> None:
    """Test Claude query fails when API key is not configured."""
    with patch("app.utils.query_claude_stream") as mock_stream, \
         patch("app.utils.settings.ANTHROPIC_API_KEY", None):
        mock_stream.side_effect = ValueError("ANTHROPIC_API_KEY must be configured in environment variables")

        data = {"prompt": "What is 2+2?"}
        response = await client.post(
            f"{settings.API_V1_STR}/claude/query",
            json=data,
        )

        assert response.status_code == 400
        content = response.json()
        assert "ANTHROPIC_API_KEY" in content["detail"]


@pytest.mark.asyncio
async def test_query_claude_invalid_request(client: AsyncClient) -> None:
    """Test Claude query with invalid request data."""
    # Test missing prompt
    data = {"options": {"allowed_tools": ["Read"]}}
    response = await client.post(
        f"{settings.API_V1_STR}/claude/query",
        json=data,
    )

    # Pydantic validation should catch this
    assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_get_claude_session_not_implemented(client: AsyncClient) -> None:
    """Test getting Claude session returns not implemented."""
    response = await client.get(
        f"{settings.API_V1_STR}/claude/sessions/test-session-123",
    )

    assert response.status_code == 501
    content = response.json()
    assert "not yet implemented" in content["detail"]


@pytest.mark.asyncio
async def test_query_claude_with_session_id(client: AsyncClient) -> None:  # type: ignore
    """Test Claude query accepts session_id parameter."""
    mock_message = {
        "id": "test-msg-1",
        "type": "assistant",
        "content": [{"type": "text", "text": "Hello from Claude!"}],
    }

    with patch("app.utils.query_claude_stream") as mock_stream, \
         patch("app.utils.settings.ANTHROPIC_API_KEY", "test-key"):
        async def mock_generator():
            yield json.dumps(mock_message) + "\n"

        mock_stream.return_value = mock_generator()

        # Test with session_id
        data = {
            "prompt": "Continue our conversation",
            "session_id": "session-123",
            "options": {}
        }
        response = await client.post(
            f"{settings.API_V1_STR}/claude/query",
            json=data,
        )

        assert response.status_code == 200
        # Verify session_id is passed through (though not used in current implementation)
        mock_stream.assert_called_once_with("Continue our conversation", {})


@pytest.mark.asyncio
async def test_query_claude_sdk_error(client: AsyncClient) -> None:
    """Test Claude query handles SDK errors gracefully."""
    with patch("app.utils.query_claude_stream") as mock_stream, \
         patch("app.utils.settings.ANTHROPIC_API_KEY", "test-key"):
        # Mock an exception in the stream
        mock_stream.side_effect = Exception("SDK connection failed")

        data = {"prompt": "What is 2+2?"}
        response = await client.post(
            f"{settings.API_V1_STR}/claude/query",
            json=data,
        )

        assert response.status_code == 500
        content = response.json()
        assert "Claude SDK error" in content["detail"]


@pytest.mark.asyncio
async def test_query_claude_create_directory(client: AsyncClient) -> None:
    """Test Claude query with automatic directory creation."""
    import os
    import tempfile

    with patch("app.utils.query_claude_stream") as mock_stream, \
         patch("app.utils.settings.ANTHROPIC_API_KEY", "test-key"):
        # Create a temporary directory path that doesn't exist
        temp_base = tempfile.gettempdir()
        new_dir = os.path.join(temp_base, "claude_test_project")

        # Ensure directory doesn't exist
        if os.path.exists(new_dir):
            os.rmdir(new_dir)

        mock_message = {
            "id": "test-msg-1",
            "type": "assistant",
            "content": [{"type": "text", "text": "Project created!"}],
        }

        async def mock_generator():
            yield json.dumps(mock_message) + "\n"

        mock_stream.return_value = mock_generator()

        # Test with create_directory: true
        data: Any = {
            "prompt": "Create a new project",
            "working_directory": new_dir,
            "create_directory": True
        }
        response = await client.post(
            f"{settings.API_V1_STR}/claude/query",
            json=data,
        )

        assert response.status_code == 200
        # Directory should be created
        assert os.path.exists(new_dir)
        assert os.path.isdir(new_dir)

        # Clean up
        if os.path.exists(new_dir):
            os.rmdir(new_dir)


@pytest.mark.asyncio
async def test_query_claude_directory_not_exists_error(client: AsyncClient) -> None:
    """Test Claude query fails when directory doesn't exist and create_directory is false."""
    import os
    import tempfile

    temp_base = tempfile.gettempdir()
    nonexistent_dir = os.path.join(temp_base, "nonexistent_claude_dir")

    # Ensure directory doesn't exist
    if os.path.exists(nonexistent_dir):
        os.rmdir(nonexistent_dir)

    data: Any = {
        "prompt": "Hello",
        "working_directory": nonexistent_dir,
        "create_directory": False  # Default is false
    }
    response = await client.post(
        f"{settings.API_V1_STR}/claude/query",
        json=data,
    )

    assert response.status_code == 400
    content = response.json()
    assert "does not exist" in content["detail"]
    assert "create_directory" in content["detail"]


@pytest.mark.asyncio
async def test_query_claude_with_working_directory(client: AsyncClient) -> None:
    """Test Claude query with working directory parameter."""
    mock_message = {
        "id": "test-msg-1",
        "type": "assistant",
        "content": [{"type": "text", "text": "Hello from Claude!"}],
    }

    with patch("app.utils.query_claude_stream") as mock_stream, \
         patch("app.utils.settings.ANTHROPIC_API_KEY", "test-key"), \
         patch("os.chdir") as mock_chdir, \
         patch("os.getcwd", return_value="/original/dir"):
        async def mock_generator():
            yield json.dumps(mock_message) + "\n"

        mock_stream.return_value = mock_generator()

        # Test with working directory
        data: Any = {
            "prompt": "List files in current directory",
            "working_directory": "/tmp/test-project"
        }
        response = await client.post(
            f"{settings.API_V1_STR}/claude/query",
            json=data,
        )

        assert response.status_code == 200
        # Verify working directory was changed
        mock_chdir.assert_any_call("/tmp/test-project")
        # Verify it was changed back to original
        mock_chdir.assert_any_call("/original/dir")
        mock_stream.assert_called_once_with("List files in current directory", None)


@pytest.mark.asyncio
async def test_query_claude_invalid_working_directory(client: AsyncClient) -> None:
    """Test Claude query with invalid working directory."""
    with patch("os.chdir") as mock_chdir, \
         patch("app.utils.settings.ANTHROPIC_API_KEY", "test-key"):
        # Mock chdir to raise an exception for invalid directory
        mock_chdir.side_effect = OSError("No such file or directory")

        data: Any = {
            "prompt": "Hello",
            "working_directory": "/nonexistent/directory"
        }
        response = await client.post(
            f"{settings.API_V1_STR}/claude/query",
            json=data,
        )

        assert response.status_code == 500
        content = response.json()
        assert "Claude SDK error" in content["detail"]
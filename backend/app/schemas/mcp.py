"""MCP (Model Context Protocol) related Pydantic models and schemas.

This module defines the data models for MCP server inspection and snapshot responses.
"""

from typing import Any

from pydantic import BaseModel, Field, model_validator


class MCPToolSchema(BaseModel):
    """Schema definition for an MCP tool."""

    name: str
    description: str | None = None
    input_schema: dict[str, Any] = Field(alias="inputSchema")  # JSON Schema for tool parameters


class MCPResourceSchema(BaseModel):
    """Schema definition for an MCP resource."""

    uri: str
    name: str
    description: str | None = None
    mime_type: str | None = Field(default=None, alias="mimeType")


class MCPPromptSchema(BaseModel):
    """Schema definition for an MCP prompt."""

    name: str
    description: str | None = None
    arguments: list[dict[str, Any]] | None = None


class MCPSnapshot(BaseModel):
    """Complete snapshot of MCP server capabilities."""

    tools: list[MCPToolSchema]
    resources: list[MCPResourceSchema]
    prompts: list[MCPPromptSchema]
    server_info: dict[str, Any] | None = None
    transport_type: str  # "http", "sse", "stdio"


class MCPInspectRequest(BaseModel):
    """Request model for MCP inspection."""

    url: str | None = None  # For remote MCP servers
    command: str | None = None  # For local MCP setup commands
    timeout: int | None = 30  # Timeout in seconds

    @model_validator(mode='after')
    def validate_request(self) -> 'MCPInspectRequest':
        if not self.url and not self.command:
            raise ValueError("Either 'url' or 'command' must be provided")
        if self.url and self.command:
            raise ValueError("Cannot specify both 'url' and 'command'")
        return self
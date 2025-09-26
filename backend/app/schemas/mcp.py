"""MCP (Model Context Protocol) related Pydantic models and schemas.

This module defines the data models for MCP server inspection and snapshot responses.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, model_validator


class MCPToolSchema(BaseModel):
    """Schema definition for an MCP tool."""

    name: str
    description: Optional[str] = None
    input_schema: Dict[str, Any] = Field(alias="inputSchema")  # JSON Schema for tool parameters


class MCPResourceSchema(BaseModel):
    """Schema definition for an MCP resource."""

    uri: str
    name: str
    description: Optional[str] = None
    mime_type: Optional[str] = Field(default=None, alias="mimeType")


class MCPPromptSchema(BaseModel):
    """Schema definition for an MCP prompt."""

    name: str
    description: Optional[str] = None
    arguments: Optional[List[Dict[str, Any]]] = None


class MCPSnapshot(BaseModel):
    """Complete snapshot of MCP server capabilities."""

    tools: List[MCPToolSchema]
    resources: List[MCPResourceSchema]
    prompts: List[MCPPromptSchema]
    server_info: Optional[Dict[str, Any]] = None
    transport_type: str  # "http", "sse", "stdio"


class MCPInspectRequest(BaseModel):
    """Request model for MCP inspection."""

    url: Optional[str] = None  # For remote MCP servers
    command: Optional[str] = None  # For local MCP setup commands
    timeout: Optional[int] = 30  # Timeout in seconds

    @model_validator(mode='after')
    def validate_request(self) -> 'MCPInspectRequest':
        if not self.url and not self.command:
            raise ValueError("Either 'url' or 'command' must be provided")
        if self.url and self.command:
            raise ValueError("Cannot specify both 'url' and 'command'")
        return self
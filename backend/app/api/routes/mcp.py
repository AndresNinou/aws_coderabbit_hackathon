"""MCP (Model Context Protocol) API routes module.

Provides endpoints for inspecting MCP servers and retrieving comprehensive snapshots
of their capabilities including tools, resources, and prompts.
"""

import asyncio
import json
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from app.schemas.mcp import (
    MCPInspectRequest,
    MCPSnapshot,
    MCPPromptSchema,
    MCPResourceSchema,
    MCPToolSchema,
)

router = APIRouter(prefix="/mcp", tags=["mcp"])


def detect_transport_type(server_spec: str) -> str:
    """Detect the transport type based on the server specification.

    Args:
        server_spec: The server URL or command string

    Returns:
        Transport type: "http", "sse", or "stdio"
    """
    if server_spec.startswith("http://") or server_spec.startswith("https://"):
        if server_spec.endswith("/sse"):
            return "sse"
        else:
            return "http"
    else:
        return "stdio"


async def run_mcptools_command(command: str, timeout: int = 30) -> str:
    """Execute a mcptools command asynchronously with timeout.

    Args:
        command: The mcptools command to execute
        timeout: Timeout in seconds

    Returns:
        Command output as string, or "error: Method not found" if capability not supported

    Raises:
        HTTPException: If command times out or fails (except "Method not found")
    """
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=timeout
        )

        output = stdout.decode().strip()
        error_output = stderr.decode().strip()

        # If the command returns "Method not found", that's expected for unsupported capabilities
        if "error: Method not found" in error_output.lower():
            return "error: Method not found"

        if process.returncode != 0:
            error_msg = error_output if error_output else "Unknown error"
            raise HTTPException(
                status_code=502,
                detail=f"mcptools command failed: {error_msg}"
            )

        return output

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=408,
            detail=f"mcptools command timed out after {timeout} seconds"
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute mcptools command: {str(e)}"
        )


def parse_mcptools_json(output: str) -> Dict[str, Any]:
    """Parse JSON output from mcptools, handling error cases.

    Args:
        output: Raw output from mcptools command

    Returns:
        Parsed JSON data or empty dict for "Method not found" errors
    """
    # Handle "Method not found" errors gracefully
    if output.strip().lower() == "error: method not found":
        return {}

    try:
        return json.loads(output)
    except json.JSONDecodeError:
        # If it's not valid JSON and not a "Method not found" error,
        # treat it as an unexpected error
        raise HTTPException(
            status_code=502,
            detail=f"Invalid JSON response from mcptools: {output[:200]}..."
        )


def parse_tools_data(data: Dict[str, Any]) -> List[MCPToolSchema]:
    """Parse tools data from mcptools JSON output.

    Args:
        data: Parsed JSON data from mcptools

    Returns:
        List of MCPToolSchema objects
    """
    tools: List[MCPToolSchema] = []
    tools_list = data.get("tools", [])

    for tool_data in tools_list:
        try:
            # Use model_validate to properly handle aliases
            tool = MCPToolSchema.model_validate(tool_data)
            tools.append(tool)
        except ValidationError as e:
            # Log validation error but continue with other tools
            print(f"Warning: Failed to parse tool {tool_data.get('name', 'unknown')}: {e}")
            continue
        except Exception as e:
            print(f"Warning: Unexpected error parsing tool {tool_data.get('name', 'unknown')}: {e}")
            continue
    return tools


def parse_resources_data(data: Dict[str, Any]) -> List[MCPResourceSchema]:
    """Parse resources data from mcptools JSON output.

    Args:
        data: Parsed JSON data from mcptools

    Returns:
        List of MCPResourceSchema objects
    """
    resources: List[MCPResourceSchema] = []
    for resource_data in data.get("resources", []):
        try:
            # Handle the mimeType field (note: mcptools uses mimeType, not mime_type)
            resource_dict = dict(resource_data)
            if "mimeType" in resource_dict:
                resource_dict["mime_type"] = resource_dict.pop("mimeType")

            resources.append(MCPResourceSchema(**resource_dict))
        except ValidationError as e:
            # Log validation error but continue with other resources
            print(f"Warning: Failed to parse resource {resource_data.get('uri', 'unknown')}: {e}")
            continue

    return resources


def parse_prompts_data(data: Dict[str, Any]) -> List[MCPPromptSchema]:
    """Parse prompts data from mcptools JSON output.

    Args:
        data: Parsed JSON data from mcptools

    Returns:
        List of MCPPromptSchema objects
    """
    prompts: List[MCPPromptSchema] = []
    for prompt_data in data.get("prompts", []):
        try:
            prompts.append(MCPPromptSchema(**prompt_data))
        except ValidationError as e:
            # Log validation error but continue with other prompts
            print(f"Warning: Failed to parse prompt {prompt_data.get('name', 'unknown')}: {e}")
            continue

    return prompts


@router.post("/inspect", response_model=MCPSnapshot)
async def inspect_mcp_server(request: MCPInspectRequest) -> MCPSnapshot:
    """Inspect an MCP server and return a complete snapshot of its capabilities.

    This endpoint executes mcptools commands to gather comprehensive information
    about an MCP server's tools, resources, and prompts. It supports both remote
    MCP servers (via HTTP/SSE) and local MCP setup commands.

    Args:
        request: Inspection request containing either a URL or command

    Returns:
        Complete MCP server snapshot with tools, resources, and prompts

    Raises:
        HTTPException: For invalid requests, timeouts, or server errors
    """
    # Determine the server specification (URL or command)
    if request.url:
        server_spec = request.url
    elif request.command:
        server_spec = request.command
    else:
        # This should be caught by Pydantic validation, but just in case
        raise HTTPException(
            status_code=400,
            detail="Either 'url' or 'command' must be provided"
        )

    # Detect transport type
    transport_type = detect_transport_type(server_spec)

    # Build mcptools commands
    mcptools_path = "~/go/bin/mcptools"  # Path to installed mcptools binary

    tools_cmd = f'{mcptools_path} tools --format json {server_spec}'
    resources_cmd = f'{mcptools_path} resources --format json {server_spec}'
    prompts_cmd = f'{mcptools_path} prompts --format json {server_spec}'

    # Execute commands sequentially for reliability
    timeout = request.timeout or 30  # Use default if None
    try:
        tools_output = await run_mcptools_command(tools_cmd, timeout)
        resources_output = await run_mcptools_command(resources_cmd, timeout)
        prompts_output = await run_mcptools_command(prompts_cmd, timeout)

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during MCP inspection: {str(e)}"
        )

    # Parse JSON outputs
    tools_data = parse_mcptools_json(tools_output)
    resources_data = parse_mcptools_json(resources_output)
    prompts_data = parse_mcptools_json(prompts_output)

    # Convert to Pydantic models
    tools = parse_tools_data(tools_data)
    resources = parse_resources_data(resources_data)
    prompts = parse_prompts_data(prompts_data)

    # Build server info
    server_info = {
        "connected": True,
        "protocol_version": "2024-11-05",  # Based on mcptools README
        "server_spec": server_spec
    }

    # Return complete snapshot
    return MCPSnapshot(
        tools=tools,
        resources=resources,
        prompts=prompts,
        server_info=server_info,
        transport_type=transport_type
    )
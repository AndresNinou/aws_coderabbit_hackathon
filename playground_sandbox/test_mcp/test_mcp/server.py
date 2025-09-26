#!/usr/bin/env python3
"""
A simple MCP server that demonstrates hello world functionality using fastmcp.
"""

from typing import Any
from fastmcp import FastMCP

# Create the MCP server instance
mcp = FastMCP("Hello World MCP Server")

@mcp.tool
def say_hello(name: str = "World") -> str:
    """
    A simple tool that says hello to the specified name.
    
    Args:
        name: The name to greet (default: "World")
        
    Returns:
        A greeting message

    """
    return f"Hello, {name}! This is a greeting from the MCP server."

@mcp.tool
def get_server_info() -> dict[str, Any]:
    """
    Get information about this MCP server.
    
    Returns:
        Dictionary containing server information
    """
    return {
        "name": "Hello World MCP Server",
        "version": "0.1.0",
        "description": "A simple MCP server that demonstrates hello world functionality",
        "capabilities": ["say_hello", "get_server_info"]
    }

@mcp.resource("hello://greeting")
def hello_resource() -> str:
    """
    A resource that provides a hello world message.
    """
    return "Hello World from MCP Resource!"

@mcp.resource("hello://info")
def info_resource() -> dict[str, Any]:
    """
    A resource that provides server information.
    """
    return {
        "message": "This is a hello world MCP server",
        "created_with": "fastmcp",
        "dependency_manager": "uv"
    }

def main():
    """Main entry point for the MCP server."""
    mcp.run()

if __name__ == "__main__":
    main()

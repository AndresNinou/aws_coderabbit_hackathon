#!/usr/bin/env python3
"""
Simple test client to verify MCP server functionality.
This demonstrates how the server tools and resources work.
"""

import asyncio
import json
from test_mcp.server import mcp

async def test_server_tools():
    """Test the MCP server tools directly."""
    print("Testing MCP Server Tools:")
    print("=" * 40)
    
    # Test say_hello tool
    result1 = mcp.get_tool("say_hello")("Alice")
    print(f"say_hello('Alice'): {result1}")
    
    result2 = mcp.get_tool("say_hello")()  # Default parameter
    print(f"say_hello(): {result2}")
    
    # Test get_server_info tool
    info = mcp.get_tool("get_server_info")()
    print(f"get_server_info(): {json.dumps(info, indent=2)}")
    
    print("\nTesting MCP Server Resources:")
    print("=" * 40)
    
    # Test resources
    greeting = mcp.get_resource("hello://greeting")()
    print(f"hello://greeting: {greeting}")
    
    info_resource = mcp.get_resource("hello://info")()
    print(f"hello://info: {json.dumps(info_resource, indent=2)}")

if __name__ == "__main__":
    asyncio.run(test_server_tools())

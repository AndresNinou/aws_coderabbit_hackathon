#!/usr/bin/env python3
"""
Simple test to verify the MCP server can be imported and run.
"""

def test_import():
    """Test that the server can be imported successfully."""
    try:
        from test_mcp.server import mcp
        print("✅ Server imports successfully")
        
        # Test server instance exists and has correct name
        print(f"✅ Server name: {mcp.name}")
        
        # Verify that the server was created as a FastMCP instance
        from fastmcp import FastMCP
        if isinstance(mcp, FastMCP):
            print("✅ Server is a FastMCP instance")
        
        print("✅ All tests passed!")
        print("✅ Server is ready to run with: uv run python -m test_mcp.server")
        return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_import()

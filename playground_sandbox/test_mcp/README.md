# Hello World MCP Server

A simple Model Context Protocol (MCP) server that demonstrates basic functionality using FastMCP and uv for dependency management.

## Features

This MCP server provides:

### Tools
- **say_hello(name)**: Returns a greeting message for the specified name (defaults to "World")
- **get_server_info()**: Returns information about the server including version and capabilities

### Resources  
- **hello://greeting**: A simple hello world message
- **hello://info**: Server information including creation details

## Requirements

- Python >=3.10
- uv (for dependency management)

## Installation

1. Clone or download this project
2. Install dependencies using uv:
   ```bash
   uv sync
   ```

## Usage

### Running the MCP Server

To start the MCP server:

```bash
uv run python -m test_mcp.server
```

The server will start in STDIO mode, ready to accept MCP client connections.

### Testing the Server

Run the test script to verify functionality:

```bash
uv run python test_server.py
```

## Development

The project structure:
```
test_mcp/
├── test_mcp/
│   ├── __init__.py
│   └── server.py          # Main MCP server implementation
├── test_server.py         # Test script
├── pyproject.toml         # Project configuration and dependencies
├── .python-version        # Python version (3.10)
└── README.md             # This file
```

## Dependencies

- **fastmcp**: Modern Python framework for building MCP servers
- Managed with **uv** for fast, reliable dependency resolution

## License

This is a demo project for learning MCP server development.
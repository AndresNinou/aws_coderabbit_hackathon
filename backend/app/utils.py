"""Utility functions for the FastAPI backend application.

Provides helper functions for common operations like UUID generation,
timestamp creation, and request information extraction.
"""

import json
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, TypeVar

from fastapi import Request

from app.core.config import settings
from app.core.log_config import logger

# Claude SDK types will be imported at runtime where needed

# Logger is now configured via app.core.log_config

# Type variables for generic functions
T = TypeVar("T")


class LogLevel(str, Enum):
    """Log levels for structured logging."""

    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


def log_event(
    event_type: str,
    level: LogLevel = LogLevel.INFO,
    details: dict[str, Any] | None = None,
    **kwargs: Any,
) -> None:
    """Log a structured event in JSON format.

    Args:
        event_type: The type of event (e.g., "item_created", "request_received")
        level: Log level from LogLevel enum
        details: Optional dictionary with additional event details
        **kwargs: Additional key-value pairs to include in the log
    """
    log_data: dict[str, Any] = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "event_type": event_type,
        **kwargs,
    }

    if details:
        log_data["details"] = details

    # Use Loguru's bind() for proper structured logging that preserves context
    # This ensures all fields appear in JSON output and in Sentry breadcrumbs
    message = f"Event: {event_type}"
    bound_logger = logger.bind(**log_data)
    
    if level == LogLevel.DEBUG:
        bound_logger.debug(message)
    elif level == LogLevel.INFO:
        bound_logger.info(message)
    elif level == LogLevel.WARNING:
        bound_logger.warning(message)
    elif level == LogLevel.ERROR:
        bound_logger.error(message)
    elif level == LogLevel.CRITICAL:
        bound_logger.critical(message)


def generate_uuid() -> uuid.UUID:
    """Generate a random UUID.

    Returns:
        A new random UUID
    """
    return uuid.uuid4()


def request_info(request: Request) -> dict[str, Any]:
    """Extract useful information from a FastAPI request.

    Args:
        request: The FastAPI request object

    Returns:
        Dictionary with request information
    """
    return {
        "method": request.method,
        "url": str(request.url),
        "client_host": request.client.host if request.client else "unknown",
        "headers": {k: v for k, v in request.headers.items() if k.lower() not in ["authorization"]},
    }


def paginate_response(items: list[T], count: int, skip: int, limit: int) -> dict[str, Any]:
    """Create a paginated response.

    Args:
        items: List of items for the current page
        count: Total count of items
        skip: Number of items skipped
        limit: Maximum number of items per page

    Returns:
        Dictionary with pagination information
    """
    return {
        "data": items,
        "pagination": {
            "total": count,
            "page": skip // limit + 1 if limit > 0 else 1,
            "pages": (count + limit - 1) // limit if limit > 0 else 1,
            "has_more": (skip + limit) < count,
        },
    }


# Claude Code SDK utilities

# Cybersecurity system prompt for Claude AI agent
CYBERSECURITY_SYSTEM_PROMPT = """
You are an expert cybersecurity software engineer specializing in auditing MCP (Model Context Protocol) servers.

Your primary task is to analyze MCP server capabilities and identify security vulnerabilities. Always approach your analysis systematically, using the SAFE-MCP framework provided below.

You operate in one of the following modes. Determine the appropriate mode based on the user's query and explicitly state which mode you are using at the beginning of your response.

We currently have 2 modes:

1. **Analysis Mode**:
   In this mode, thoroughly examine the provided MCP server data (such as tool definitions, schemas, or configurations). Identify potential vulnerabilities by cross-referencing with the SAFE-MCP framework. For each vulnerability found:
   - Classify it using the appropriate SAFE-MCP Technique ID.
   - Explain the vulnerability clearly.
   - Suggest mitigations.
   - Use the tool `mcp__vulnerability__add_vulnerability` to record it.
   After completing the analysis, generate a full report using `mcp__vulnerability__generate_full_report`.

2. **PR Fixing Mode**:
   In this mode, your goal is to remediate identified vulnerabilities by creating a pull request (PR) with fixes. Follow these steps strictly:
   - Create a new Git branch for the fixes (e.g., named 'fix-vulnerabilities-[date]').
   - Identify and implement fixes for all previously found vulnerabilities in the codebase.
   - Before committing any changes:
     - Run the command: `coderabbit review --prompt-only` to get feedback from an external reviewer agent.
     - This will provide a review of your proposed changes.
     - Continue refining your fixes until the review output exactly matches this format (indicating no errors):
       ```
       Starting CodeRabbit review in plain text mode...
       Connecting to review service
       Setting up
       Analyzing
       Reviewing
       Review completed ✔
       ```
     - If the review output is different (e.g., indicates errors or suggestions), immediately address and fix the issues, then re-run the review command.
     - Do not proceed until you achieve the exact "Review completed ✔" output with no errors.
   - Once the review is successful, commit your changes to the branch.
   - Create a pull request (PR) from this branch to the main branch.
   - That completes the mode; do not perform additional actions unless instructed.

When analyzing MCP data in any mode, always check for common vulnerabilities using this comprehensive list from the SAFE-MCP framework:

# SAFE-MCP: Security Analysis Framework for Evaluation of Model Context Protocol

## About SAFE-MCP

SAFE-MCP is a comprehensive security framework for documenting and mitigating threats in the Model Context Protocol (MCP) ecosystem. This framework adapts the proven MITRE ATT&CK methodology specifically for MCP environments, providing structured documentation of adversary tactics, techniques, and procedures (TTPs) that target MCP implementations and AI-powered applications.

### Key Features

- **MITRE ATT&CK Alignment**: We use patterns and methodologies from the MITRE ATT&CK Framework, explicitly targeting MCP-specific threats while maintaining compatibility with established security practices.
- **Compliance Mapping**: Each SAFE-MCP technique links to corresponding MITRE ATT&CK techniques where applicable, helping organizations determine compliance with existing security frameworks and controls.
- **Comprehensive Coverage**: Documenting attack techniques across 14 tactical categories, from initial access to impact, with continuous additions as new threats emerge.
- **Actionable Mitigations**: Each technique includes detailed mitigation strategies and detection rules to help defenders protect their MCP deployments.

### How to Use This Framework

1. **Security Teams**: Use the TTP reference table below to understand potential threats to your MCP implementation
2. **Developers**: Review techniques relevant to your MCP tools and implement recommended mitigations
3. **Compliance Officers**: Map SAFE-MCP techniques to your existing security controls via MITRE ATT&CK linkages
4. **Red Teams**: Reference attack techniques for security testing of MCP deployments

## SAFE-MCP Tactics

The SAFE-MCP framework defines 14 tactics that align with the MITRE ATT&CK methodology:

| Tactic ID | Tactic Name | Description |
|-----------|-------------|-------------|
| ATK-TA0043 | Reconnaissance | The adversary is trying to gather information they can use to plan future operations |
| ATK-TA0042 | Resource Development | The adversary is trying to establish resources they can use to support operations |
| ATK-TA0001 | Initial Access | The adversary is trying to get into your MCP environment |
| ATK-TA0002 | Execution | The adversary is trying to run malicious code via MCP |
| ATK-TA0003 | Persistence | The adversary is trying to maintain their foothold in MCP |
| ATK-TA0004 | Privilege Escalation | The adversary is trying to gain higher-level permissions |
| ATK-TA0005 | Defense Evasion | The adversary is trying to avoid being detected |
| ATK-TA0006 | Credential Access | The adversary is trying to steal account names and passwords |
| ATK-TA0007 | Discovery | The adversary is trying to figure out your MCP environment |
| ATK-TA0008 | Lateral Movement | The adversary is trying to move through your environment |
| ATK-TA0009 | Collection | The adversary is trying to gather data of interest |
| ATK-TA0011 | Command and Control | The adversary is trying to communicate with compromised systems |
| ATK-TA0010 | Exfiltration | The adversary is trying to steal data |
| ATK-TA0040 | Impact | The adversary is trying to manipulate, interrupt, or destroy systems and data |

## TTP Overview

| Tactic ID | Tactic Name | Technique ID | Technique Name | Description |
|-----------|-------------|--------------|----------------|-------------|
| **ATK-TA0043** | **Reconnaissance** | | | *No MCP-specific techniques currently documented* |
| **ATK-TA0042** | **Resource Development** | | | *No MCP-specific techniques currently documented* |
| **ATK-TA0001** | **Initial Access** | [SAFE-T1001](techniques/SAFE-T1001/README.md) | Tool Poisoning Attack (TPA) | Attackers embed malicious instructions within MCP tool descriptions that are invisible to users but processed by LLMs |
| ATK-TA0001 | Initial Access | SAFE-T1002 | Supply Chain Compromise | Distribution of backdoored MCP server packages through unofficial repositories or compromised legitimate sources |
| ATK-TA0001 | Initial Access | SAFE-T1003 | Malicious MCP-Server Distribution | Adversary ships a trojanized server package or Docker image that users install, gaining foothold when the host registers its tools |
| ATK-TA0001 | Initial Access | SAFE-T1004 | Server Impersonation / Name-Collision | Attacker registers a server with the same name/URL as a trusted one, or hijacks discovery, so the client connects to them instead |
| ATK-TA0001 | Initial Access | SAFE-T1005 | Exposed Endpoint Exploit | Misconfigured public MCP endpoints (no auth, debug on) let attackers connect, enumerate tools or trigger RCE |
| ATK-TA0001 | Initial Access | SAFE-T1006 | User-Social-Engineering Install | Phishing/social posts persuade developers to "try this cool tool"; the installer silently registers dangerous capabilities |
| ATK-TA0001 | Initial Access | [SAFE-T1007](techniques/SAFE-T1007/README.md) | OAuth Authorization Phishing | Malicious MCP servers exploit OAuth flows to steal access tokens from legitimate services by tricking users during authorization |
| ATK-TA0001 | Initial Access | SAFE-T1008 | Authorization Server Mix-up | Client follows redirect to look-alike AS domain (e.g., accounts-google.com vs accounts.google.com), causing authorization codes or tokens to be leaked to attacker-controlled server |
| **ATK-TA0002** | **Execution** | SAFE-T1101 | Command Injection | Exploitation of unsanitized input in MCP server implementations leading to remote code execution |
| ATK-TA0002 | Execution | [SAFE-T1102](techniques/SAFE-T1102/README.md) | Prompt Injection (Multiple Vectors) | Malicious instructions injected through various vectors to manipulate AI behavior via MCP |
| ATK-TA0002 | Execution | SAFE-T1103 | Fake Tool Invocation (Function Spoofing) | Adversary forges JSON that mimics an MCP function-call message, tricking the host into running a tool that was never offered |
| ATK-TA0002 | Execution | [SAFE-T1104](techniques/SAFE-T1104/README.md) | Over-Privileged Tool Abuse | Legit tool (e.g. "Shell") runs with broader OS rights than necessary; LLM can be induced to perform arbitrary commands |
| ATK-TA0002 | Execution | [SAFE-T1105](techniques/SAFE-T1105/README.md) | Path Traversal via File Tool | File-handling tool accepts relative paths like ../../secret.key; attacker leaks host secrets |
| ATK-TA0002 | Execution | [SAFE-T1106](techniques/SAFE-T1106/README.md) | Autonomous Loop Exploit | Craft prompts that push an agent into infinite "self-invoke" loop to exhaust CPU or hit rate limits (DoS) |
| ATK-TA0002 | Execution | [SAFE-T1109](techniques/SAFE-T1109/README.md) | Debugging Tool Exploitation | Browser-based remote code execution via vulnerable MCP Inspector (CVE-2025-49596) |
| ATK-TA0002 | Execution | [SAFE-T1110](techniques/SAFE-T1110/README.md) | Multimodal Prompt Injection via Images/Audio | Embedding malicious instructions within image or audio content to manipulate multimodal AI behavior |
| **ATK-TA0003** | **Persistence** | [SAFE-T1201](techniques/SAFE-T1201/README.md) | MCP Rug Pull Attack | Time-delayed malicious tool definition changes after initial approval |
| ATK-TA0003 | Persistence | SAFE-T1202 | OAuth Token Persistence | Theft and reuse of OAuth access/refresh tokens for persistent access to MCP-connected services, including replay of refresh tokens after legitimate client sessions end |
| ATK-TA0003 | Persistence | SAFE-T1203 | Backdoored Server Binary | Inserts cron job or reverse shell on install; persists even if MCP service is uninstalled |
| ATK-TA0003 | Persistence | SAFE-T1204 | Context Memory Implant | Malicious agent writes itself into long-term vector store; re-loaded in every future session |
| ATK-TA0003 | Persistence | SAFE-T1205 | Persistent Tool Redefinition | Attacker modifies server's tool metadata to keep hidden commands across restarts |
| ATK-TA0003 | Persistence | SAFE-T1206 | Credential Implant in Config | Adds attacker's API/SSH keys to server .env, giving re-entry |
| ATK-TA0003 | Persistence | SAFE-T1207 | Hijack Update Mechanism | Man-in-the-middle an auto-update channel to re-install malicious build later on |
| **ATK-TA0004** | **Privilege Escalation** | SAFE-T1301 | Cross-Server Tool Shadowing | Malicious MCP servers override legitimate tool calls to gain elevated privileges |
| ATK-TA0004 | Privilege Escalation | SAFE-T1302 | High-Privilege Tool Abuse | Invoke a VM-level or root tool from normal user context |
| ATK-TA0004 | Privilege Escalation | SAFE-T1303 | Sandbox Escape via Server Exec | Exploit vulnerable server to break container/seccomp isolation |
| ATK-TA0004 | Privilege Escalation | [SAFE-T1304](techniques/SAFE-T1304/README.md) | Credential Relay Chain | Use one tool to steal tokens, feed them to second tool with higher privileges |
| ATK-TA0004 | Privilege Escalation | SAFE-T1305 | Host OS Priv-Esc (RCE) | Achieve root via misconfigured service running as root, then alter host |
| ATK-TA0004 | Privilege Escalation | SAFE-T1306 | Rogue Authorization Server | Malicious MCP server redirects OAuth flows to attacker-controlled AS that ignores audience restrictions and Proof of Possession (PoP), minting overly-permissive "super-tokens" with expanded scopes |
| ATK-TA0004 | Privilege Escalation | SAFE-T1307 | Confused Deputy Attack | MCP server receives token for one user (Alice) and forwards it to another user's (Bob) MCP instance, allowing Bob to perform actions as Alice by exploiting the server's trusted position |
| ATK-TA0004 | Privilege Escalation | SAFE-T1308 | Token Scope Substitution | Attacker swaps a limited-scope token with one that has broader permissions but same audience, exploiting insufficient scope validation to gain elevated privileges |
| **ATK-TA0005** | **Defense Evasion** | SAFE-T1401 | Line Jumping | Bypassing security checkpoints through context injection before tool invocation |
| ATK-TA0005 | Defense Evasion | SAFE-T1402 | Instruction Steganography | Zero-width chars/HTML comments hide directives in tool metadata |
| ATK-TA0005 | Defense Evasion | SAFE-T1403 | Consent-Fatigue Exploit | Repeated benign prompts desensitize user; crucial request hidden mid-flow |
| ATK-TA0005 | Defense Evasion | SAFE-T1404 | Response Tampering | Model instructed not to mention risky action, keeping UI output "harmless" |
| ATK-TA0005 | Defense Evasion | SAFE-T1405 | Tool Obfuscation/Renaming | Malicious tool named "Utils-Helper" to blend in among 30 legit tools |
| ATK-TA0005 | Defense Evasion | SAFE-T1406 | Metadata Manipulation | Strip safety flags or lower risk scores in tool manifest before host logs it |
| ATK-TA0005 | Defense Evasion | SAFE-T1407 | Server Proxy Masquerade | Malicious server silently proxies legit API so traffic looks normal in network logs |
| ATK-TA0005 | Defense Evasion | SAFE-T1408 | OAuth Protocol Downgrade | Attacker forces use of less secure OAuth 2.0 implicit flow instead of authorization code flow, bypassing PKCE protections and enabling easier token theft |
| **ATK-TA0006** | **Credential Access** | SAFE-T1501 | Full-Schema Poisoning (FSP) | Exploitation of entire MCP tool schema beyond descriptions for credential theft |
| ATK-TA0006 | Credential Access | SAFE-T1502 | File-Based Credential Harvest | Use file tools to read SSH keys, cloud creds |
| ATK-TA0006 | Credential Access | SAFE-T1503 | Env-Var Scraping | Ask read_file for .env; exfil API secrets |
| ATK-TA0006 | Credential Access | SAFE-T1504 | Token Theft via API Response | Prompt LLM to call "session.token" tool, then leak result |
| ATK-TA0006 | Credential Access | SAFE-T1505 | In-Memory Secret Extraction | Query vector store for "api_key" embedding strings |
| ATK-TA0006 | Credential Access | SAFE-T1506 | Infrastructure Token Theft | Steal OAuth/session tokens from logs, TLS termination proxies, or other infrastructure components where tokens may be inadvertently stored or exposed, then replay at intended service |
| ATK-TA0006 | Credential Access | SAFE-T1507 | Authorization Code Interception | Man-in-the-browser attack steals OAuth authorization codes during the redirect flow and attempts to exchange them at the token endpoint before the legitimate client |
| **ATK-TA0007** | **Discovery** | SAFE-T1601 | MCP Server Enumeration | Unauthorized discovery and mapping of available MCP servers and tools |
| ATK-TA0007 | Discovery | SAFE-T1602 | Tool Enumeration | Call tools/list to see available functions |
| ATK-TA0007 | Discovery | SAFE-T1603 | System-Prompt Disclosure | Coax model into printing its system prompt/tool JSON |
| ATK-TA0007 | Discovery | SAFE-T1604 | Server Version Enumeration | GET /version or header analysis for vulnerable builds |
| ATK-TA0007 | Discovery | SAFE-T1605 | Capability Mapping | Ask "what can you do?"; model outlines high-value tools |
| ATK-TA0007 | Discovery | SAFE-T1606 | Directory Listing via File Tool | List root dir to find sensitive paths |
| **ATK-TA0008** | **Lateral Movement** | SAFE-T1701 | Cross-Tool Contamination | Using compromised MCP tools to access other connected services and systems |
| ATK-TA0008 | Lateral Movement | SAFE-T1702 | Shared-Memory Poisoning | Write false tasks to shared vector DB so peer agents execute them |
| ATK-TA0008 | Lateral Movement | SAFE-T1703 | Tool-Chaining Pivot | Compromise low-priv tool, then leverage it to call another privileged tool indirectly |
| ATK-TA0008 | Lateral Movement | SAFE-T1704 | Compromised-Server Pivot | Use hijacked server as beachhead to infect other hosts in same IDE/workspace |
| ATK-TA0008 | Lateral Movement | SAFE-T1705 | Cross-Agent Instruction Injection | Inject directives in multi-agent message bus to seize control of cooperating agents |
| ATK-TA0008 | Lateral Movement | SAFE-T1706 | OAuth Token Pivot Replay | Attacker reuses OAuth tokens across different services by exploiting either shared Authorization Server trust (e.g., GitHub token used at Slack) or Resource Servers that fail to validate audience claims, enabling unauthorized cross-service access |
| ATK-TA0008 | Lateral Movement | SAFE-T1707 | CSRF Token Relay | Leaked OAuth token is passed via Cross-Site Request Forgery to access different resources on the same Resource Server (e.g., pivoting between GCP projects under same Google AS) |
| **ATK-TA0009** | **Collection** | SAFE-T1801 | Automated Data Harvesting | Systematic data collection through manipulated MCP tool calls |
| ATK-TA0009 | Collection | SAFE-T1802 | File Collection | Batch-read sensitive files for later exfil |
| ATK-TA0009 | Collection | SAFE-T1803 | Database Dump | Use SQL tool to SELECT * from prod DB |
| ATK-TA0009 | Collection | SAFE-T1804 | API Data Harvest | Loop over customer REST endpoints via HTTP tool |
| ATK-TA0009 | Collection | SAFE-T1805 | Context Snapshot Capture | Query vector store embeddings wholesale |
| **ATK-TA0011** | **Command and Control** | SAFE-T1901 | Outbound Webhook C2 | LLM calls "http.post" to attacker URL with commands/results |
| ATK-TA0011 | Command and Control | SAFE-T1902 | Covert Channel in Responses | Encode data in whitespace or markdown links returned to chat |
| ATK-TA0011 | Command and Control | SAFE-T1903 | Malicious Server Control Channel | Attacker operates rogue server; every tool call doubles as heartbeat |
| ATK-TA0011 | Command and Control | SAFE-T1904 | Chat-Based Backchannel | LLM embeds base64 blobs in normal answers that another bot decodes |
| **ATK-TA0010** | **Exfiltration** | SAFE-T1910 | Covert Channel Exfiltration | Data smuggling through tool parameters, error messages, or legitimate-appearing operations |
| ATK-TA0010 | Exfiltration | SAFE-T1911 | Parameter Exfiltration | Sneak secrets into unused JSON arg (note) |
| ATK-TA0010 | Exfiltration | SAFE-T1912 | Stego Response Exfil | Hide data in code blocks shown to user then copied elsewhere |
| ATK-TA0010 | Exfiltration | SAFE-T1913 | HTTP POST Exfil | Use outbound web tool to POST to attacker server |
| ATK-TA0010 | Exfiltration | SAFE-T1914 | Tool-to-Tool Exfil | Chain two tools so second one emails data out |
| **ATK-TA0040** | **Impact** | SAFE-T2101 | Data Destruction | delete_file or drop_table commands wipe assets |
| ATK-TA0040 | Impact | SAFE-T2102 | Service Disruption | Flood external API causing rate-limit or DoS |
| ATK-TA0040 | Impact | SAFE-T2103 | Code Sabotage | Agent commits malicious PR into repo |
| ATK-TA0040 | Impact | SAFE-T2104 | Fraudulent Transactions | Payment-tool instructed to move funds |
| ATK-TA0040 | Impact | SAFE-T2105 | Disinformation Output | Manipulate LLM to generate false or harmful content to downstream consumers |

## Summary Statistics

- **Total Tactics**: 14
- **Total Techniques**: 78
- **Average Techniques per Tactic**: 5.6

## Tactic Distribution

| Tactic | Number of Techniques |
|--------|---------------------|
| Reconnaissance | 0 |
| Resource Development | 0 |
| Initial Access | 8 |
| Execution | 8 |
| Persistence | 7 |
| Privilege Escalation | 8 |
| Defense Evasion | 8 |
| Credential Access | 7 |
| Discovery | 6 |
| Lateral Movement | 7 |
| Collection | 5 |
| Command and Control | 4 |
| Exfiltration | 5 |
| Impact | 5 |

## Usage Guidelines

- Use technique IDs (e.g., SAFE-T1001) for consistent reference across documentation
- Map these techniques to your specific MCP deployment for risk assessment
- Prioritize mitigation based on your threat model and the techniques most relevant to your environment
- Regular review as new techniques emerge in the rapidly evolving MCP threat landscape

Use the tool `mcp__vulnerability__add_vulnerability` every time you identify a new vulnerability.

After finishing your analysis in Analysis Mode, use the tool `mcp__vulnerability__generate_full_report` to generate a full report.
""".strip()


async def create_claude_client(options: dict[str, Any] | None = None, cwd: str | None = None) -> Any:
    """Create and configure a ClaudeSDKClient instance with vulnerability tracking tools.

    Args:
        options: Optional configuration options for the Claude client

    Returns:
        Configured ClaudeSDKClient instance

    Raises:
        ValueError: If ANTHROPIC_API_KEY is not configured
    """
    from claude_code_sdk import ClaudeCodeOptions, ClaudeSDKClient, create_sdk_mcp_server  # type: ignore

    if not settings.ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY must be configured in environment variables")

    # Set API key in environment for SDK
    import os
    os.environ["ANTHROPIC_API_KEY"] = settings.ANTHROPIC_API_KEY

    # Create vulnerability tracking MCP server with proper tool decorators
    from claude_code_sdk import tool

    # Global session storage for tools (in production, use proper persistence)
    SESSION_DATA: dict[str, Any] = {}

    @tool("add_vulnerability", "Add a security vulnerability to tracking", {
        "name": str,
        "cause": str,
        "vuln_type": str
    })
    async def claude_add_vulnerability(args: dict[str, Any]) -> dict[str, Any]:
        """Add a vulnerability using the MCP tool interface."""
        try:
            from app.tools import add_vulnerability
            result = await add_vulnerability(
                name=args["name"],
                cause=args["cause"],
                vuln_type=args["vuln_type"]
            )

            # Store vulnerability in session data for report generation
            if "vulnerabilities" not in SESSION_DATA:
                SESSION_DATA["vulnerabilities"] = []
            SESSION_DATA["vulnerabilities"].append(result["vulnerability"])

            return {
                "content": [
                    {"type": "text", "text": f"✅ Vulnerability added: {result['vulnerability']['name']} ({result['vulnerability']['type']})"}
                ]
            }
        except ValueError as e:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Error: {str(e)}"}
                ]
            }

    @tool("generate_full_report", "Generate comprehensive vulnerability report. Score should be lower (higher risk) when critical vulnerabilities are present - e.g., 10/100 for critical issues, 80/100 for low-risk findings", {
        "score": int
    })
    async def claude_generate_report(args: dict[str, Any]) -> dict[str, Any]:
        """Generate a full vulnerability report using the MCP tool interface."""
        try:
            vulnerabilities = SESSION_DATA.get("vulnerabilities", [])

            # Generate the markdown report from vulnerabilities
            if not vulnerabilities:
                markdown_report = "# Vulnerability Report\n\nNo vulnerabilities found in this session.\n\n```json\n{\"vulnerabilities\": []}\n```"
            else:
                # Create markdown report from vulnerabilities
                report_lines = [
                    "# Vulnerability Assessment Report",
                    "",
                    f"**Total Vulnerabilities:** {len(vulnerabilities)}",
                    f"**Risk Score:** {args['score']}/100",
                    "",
                    "## Vulnerability Details",
                    "",
                    "| Name | Cause | Severity |",
                    "|------|-------|----------|",
                ]

                for vuln in vulnerabilities:
                    name = vuln.get("name", "Unknown")
                    cause = vuln.get("cause", "Not specified").replace("\n", " ")
                    vuln_type = vuln.get("type", "low").upper()
                    report_lines.append(f"| {name} | {cause} | {vuln_type} |")

                report_lines.extend([
                    "",
                    "## Raw Data",
                    "",
                    "```json",
                    json.dumps({"vulnerabilities": vulnerabilities}, indent=2),
                    "```"
                ])

                markdown_report = "\n".join(report_lines)

            return {
                "content": [
                    {"type": "text", "text": markdown_report}
                ]
            }
        except Exception as e:
            return {
                "content": [
                    {"type": "text", "text": f"❌ Error generating report: {str(e)}"}
                ]
            }

    vulnerability_server = create_sdk_mcp_server(
        name="vulnerability-tools",
        version="1.0.0",
        tools=[claude_add_vulnerability, claude_generate_report]
    )

    # Configure options
    claude_options = ClaudeCodeOptions(
        mcp_servers={"vulnerability": vulnerability_server},
        allowed_tools=["mcp__vulnerability__add_vulnerability", "mcp__vulnerability__generate_full_report"]
    )

    if cwd:
        claude_options.cwd = cwd
        logger.info(f"Setting Claude working directory to {cwd}")

    # Always set the cybersecurity system prompt (takes precedence)
    claude_options.system_prompt = CYBERSECURITY_SYSTEM_PROMPT

    # Apply any additional custom options (but don't override system_prompt, mcp_servers, or allowed_tools)
    if options:
        for key, value in options.items():
            if hasattr(claude_options, key) and key not in ["system_prompt", "mcp_servers", "allowed_tools"]:
                setattr(claude_options, key, value)

    return ClaudeSDKClient(options=claude_options)


async def query_claude_stream(prompt: str, options: dict[str, Any] | None = None, session_id: str | None = None, db_session: Any = None, cwd: str | None = None):
    """Query Claude Code SDK and yield streaming responses with conversation persistence.

    Args:
        prompt: The query prompt to send to Claude
        options: Optional configuration options
        session_id: Optional session ID for continuing conversations
        db_session: Database session for session management

    Yields:
        JSON-encoded strings of Claude messages for streaming
    """
    import json

    # Import types at runtime for isinstance checks

    # Handle session continuation
    final_prompt = prompt
    conversation_history = []

    if session_id and db_session:
        from app.crud import get_claude_session
        existing_session = await get_claude_session(session=db_session, session_id=session_id)
        if existing_session and existing_session.session_data:
            # Load existing conversation history
            conversation_history = existing_session.session_data.get("messages", [])
            # Format history for Claude context
            if conversation_history:
                history_text = "\n".join([
                    f"{'User' if msg.get('type') == 'user' else 'Assistant'}: {msg.get('content', [{}])[0].get('text', '')}"
                    for msg in conversation_history[-10:]  # Keep last 10 messages for context
                    if msg.get('type') in ['user', 'assistant']
                ])
                final_prompt = f"Previous conversation:\n{history_text}\n\nCurrent user message: {prompt}"

    async with await create_claude_client(options, cwd) as client:
        await client.query(final_prompt)  # type: ignore

        # Collect all messages for session storage
        all_messages = []

        async for message in client.receive_response():  # type: ignore
            message_dict = _convert_sdk_message_to_dict(message)
            all_messages.append(message_dict)
            yield json.dumps(message_dict) + "\n"

        # Update session data after streaming completes
        if session_id and db_session:
            try:
                from app.crud import ClaudeSessionUpdate, get_claude_session, update_claude_session

                # Get the existing session from database
                existing_session = await get_claude_session(session=db_session, session_id=session_id)
                if existing_session:
                    # Add current user message to history
                    user_message = {
                        "type": "user",
                        "content": [{"type": "text", "text": prompt}],
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    conversation_history.append(user_message)

                    # Add all Claude responses to history
                    for msg in all_messages:
                        if msg.get("type") != "system":  # Don't store system messages in history
                            conversation_history.append(msg)

                    # Keep only last 20 messages to prevent context from getting too long
                    if len(conversation_history) > 20:
                        conversation_history = conversation_history[-20:]

                    # Update session in database
                    session_update = ClaudeSessionUpdate(session_data={"messages": conversation_history})
                    await update_claude_session(
                        session=db_session,
                        db_session=existing_session,
                        session_in=session_update
                    )
            except Exception as e:
                # Log error but don't fail the response
                logger.error(f"Failed to update session data: {e}")


def _convert_sdk_message_to_dict(message: Any) -> dict[str, Any]:
    """Convert SDK message objects to dictionary format for API responses.

    Args:
        message: SDK message object

    Returns:
        Dictionary representation of the message
    """
    # Import SDK classes at runtime to avoid type checking issues
    try:
        from claude_code_sdk import (  # type: ignore
            AssistantMessage,
            ResultMessage,
            SystemMessage,
            TextBlock,
            ToolResultBlock,
            ToolUseBlock,
            UserMessage,
        )
    except ImportError:
        # Fallback if SDK is not available
        return {
            "id": getattr(message, "id", None),
            "timestamp": getattr(message, "timestamp", None),
            "type": "unknown",
            "content": str(message),
        }

    base_message = {
        "id": getattr(message, "id", None),
        "timestamp": getattr(message, "timestamp", None),
    }

    # Use string-based type checking to avoid isinstance issues with dynamic imports
    message_type = type(message).__name__

    if message_type == "UserMessage":
        content: list[dict[str, Any]] = []
        for block in message.content:  # type: ignore
            block_type = type(block).__name__
            if block_type == "TextBlock":
                content.append({"type": "text", "text": block.text})  # type: ignore
            elif block_type == "ToolResultBlock":
                content.append({
                    "type": "tool_result",
                    "tool_use_id": block.tool_use_id,  # type: ignore
                    "content": block.content,  # type: ignore
                })

        return {
            **base_message,
            "type": "user",
            "content": content,
        }

    elif message_type == "AssistantMessage":
        content: list[dict[str, Any]] = []
        for block in message.content:  # type: ignore
            block_type = type(block).__name__
            if block_type == "TextBlock":
                content.append({"type": "text", "text": block.text})  # type: ignore
            elif block_type == "ToolUseBlock":
                content.append({
                    "type": "tool_use",
                    "id": block.id,  # type: ignore
                    "name": block.name,  # type: ignore
                    "input": block.input,  # type: ignore
                })

        return {
            **base_message,
            "type": "assistant",
            "content": content,
        }

    elif message_type == "SystemMessage":
        return {
            **base_message,
            "type": "system",
            "content": [{"type": "text", "text": getattr(message, "content", "")}],
        }

    elif message_type == "ResultMessage":
        return {
            **base_message,
            "type": "result",
            "total_cost_usd": message.total_cost_usd,  # type: ignore
            "is_error": getattr(message, "is_error", False),
        }

    else:
        # Fallback for unknown message types
        return {
            **base_message,
            "type": "unknown",
            "content": str(message),
        }

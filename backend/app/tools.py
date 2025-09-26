"""Vulnerability tracking tools for Claude Code integration.

Provides functions for recording security vulnerabilities and generating
comprehensive reports with scoring and visualizations.
"""

import json
from typing import Any

from app.core.log_config import logger


async def add_vulnerability(
    name: str,
    cause: str,
    vuln_type: str,
    session_data: dict[str, Any]
) -> dict[str, Any]:
    """Add a single vulnerability to the session tracking data.

    Args:
        name: The name/title of the vulnerability
        cause: Description of what causes this vulnerability
        vuln_type: Severity level (critical, high, medium, low)
        session_data: Current session data dictionary

    Returns:
        Dictionary with success status and vulnerability details

    Raises:
        ValueError: If vuln_type is not one of the allowed values
    """
    # Validate vulnerability type
    allowed_types = {"critical", "high", "medium", "low"}
    if vuln_type.lower() not in allowed_types:
        raise ValueError(f"Invalid vulnerability type '{vuln_type}'. Must be one of: {', '.join(allowed_types)}")

    # Initialize vulnerabilities list if it doesn't exist
    if "vulnerabilities" not in session_data:
        session_data["vulnerabilities"] = []

    # Create vulnerability entry
    vulnerability = {
        "name": name.strip(),
        "cause": cause.strip(),
        "type": vuln_type.lower()
    }

    # Add to session data
    session_data["vulnerabilities"].append(vulnerability)

    logger.info(f"Added vulnerability: {name} ({vuln_type})")

    return {
        "success": True,
        "vulnerability": vulnerability,
        "total_vulnerabilities": len(session_data["vulnerabilities"])
    }


async def generate_full_report(session_data: dict[str, Any]) -> str:
    """Generate a comprehensive markdown report with vulnerability analysis.

    Args:
        session_data: Session data containing vulnerabilities list

    Returns:
        Markdown formatted report with score and Mermaid chart
    """
    vulnerabilities = session_data.get("vulnerabilities", [])

    if not vulnerabilities:
        return "# Vulnerability Report\n\nNo vulnerabilities found in this session.\n\n```json\n{\"vulnerabilities\": []}\n```"

    # Calculate severity scores
    severity_weights = {
        "critical": 10,
        "high": 7,
        "medium": 4,
        "low": 1
    }

    # Count vulnerabilities by type
    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    total_score = 0

    for vuln in vulnerabilities:
        vuln_type = vuln.get("type", "low")
        severity_counts[vuln_type] += 1
        total_score += severity_weights.get(vuln_type, 1)

    # Determine overall risk level
    if total_score >= 25:
        risk_level = "CRITICAL"
        risk_color = "🔴"
    elif total_score >= 15:
        risk_level = "HIGH"
        risk_color = "🟠"
    elif total_score >= 8:
        risk_level = "MEDIUM"
        risk_color = "🟡"
    else:
        risk_level = "LOW"
        risk_color = "🟢"

    # Generate Mermaid pie chart
    chart_data: list[str] = []
    for severity in ["critical", "high", "medium", "low"]:
        count = severity_counts[severity]  # type: ignore
        if count > 0:
            chart_data.append(f'    "{severity.upper()}: {count}" : {count}')  # type: ignore

    mermaid_chart = f"""```mermaid
pie title Vulnerability Distribution
{chr(10).join(chart_data)}
```"""

    # Generate markdown report
    report_lines = [
        "# Vulnerability Assessment Report",
        "",
        f"## Risk Level: {risk_color} {risk_level}",
        "",
        f"**Total Vulnerabilities:** {len(vulnerabilities)}",
        f"**Risk Score:** {total_score}/100",
        "",
        "## Severity Breakdown",
        "",
        "| Severity | Count | Weight |",
        "|----------|-------|--------|",
    ]

    for severity in ["critical", "high", "medium", "low"]:
        count = severity_counts[severity]
        weight = severity_weights[severity]
        if count > 0:
            report_lines.append(f"| {severity.upper()} | {count} | {weight} |")

    report_lines.extend([
        "",
        "## Vulnerability Details",
        "",
        "| Name | Cause | Severity |",
        "|------|-------|----------|",
    ])

    for vuln in vulnerabilities:
        name = vuln.get("name", "Unknown")
        cause = vuln.get("cause", "Not specified").replace("\n", " ")
        vuln_type = vuln.get("type", "low").upper()
        report_lines.append(f"| {name} | {cause} | {vuln_type} |")

    report_lines.extend([
        "",
        "## Distribution Chart",
        "",
        mermaid_chart,
        "",
        "## Raw Data",
        "",
        "```json",
        json.dumps({"vulnerabilities": vulnerabilities}, indent=2),
        "```"
    ])

    return "\n".join(report_lines)
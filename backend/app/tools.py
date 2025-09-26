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
    vuln_type: str
) -> dict[str, Any]:
    """Add a single vulnerability to the session tracking data.

    Args:
        name: The name/title of the vulnerability example SAFE-T1002
        cause: Description of what causes this vulnerability with citation
        vuln_type: Severity level (critical, high, medium, low)

    Returns:
        Dictionary with success status and vulnerability details

    Raises:
        ValueError: If vuln_type is not one of the allowed values
    """
    # Validate vulnerability type
    allowed_types = {"critical", "high", "medium", "low"}
    if vuln_type.lower() not in allowed_types:
        raise ValueError(f"Invalid vulnerability type '{vuln_type}'. Must be one of: {', '.join(allowed_types)}")

    # Create vulnerability entry
    vulnerability = {
        "name": name.strip(),
        "cause": cause.strip(),
        "type": vuln_type.lower()
    }

    logger.info(f"Added vulnerability: {name} ({vuln_type})")

    return {
        "success": True,
        "vulnerability": vulnerability
    }


async def generate_full_report(report: str, score: int) -> tuple[str, int]:
    """Generate a comprehensive markdown report with vulnerability analysis.

    This function takes a list of vulnerabilities and a risk score, then generates
    a full vulnerability assessment report including mermaid diagrams and detailed analysis.

    Args:
        report: Generate a comprehensive vulnerability assessment report for the vulnerabilities found.
    Include a mermaid pie chart showing the distribution of vulnerability severities.
    Provide a detailed analysis of each vulnerability with remediation suggestions.
    Calculate and include a risk score (0-100) based on the severity and impact of all vulnerabilities found.
    Format the report with proper markdown including:
    - Risk level with emoji indicator
    - Total vulnerabilities count
    - Risk score out of 100
    - Severity breakdown table
    - Individual vulnerability details table
    - Mermaid pie chart for distribution
    - Raw vulnerability data in JSON format
        score: Risk score from 0-100 for the full list of vulnerabilities found

    Returns:
        Tuple of (markdown_formatted_report, score)


    """
    vulnerabilities = report

    if not vulnerabilities:
        empty_report = "# Vulnerability Report\n\nNo vulnerabilities found in this session.\n\n```json\n{\"vulnerabilities\": []}\n```"
        return empty_report, 0



    return report, score
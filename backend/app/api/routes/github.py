"""GitHub integration routes."""

import os
import subprocess
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.schemas.github import CreatePRRequest, CreatePRResponse
from app.integrations.github import (
    create_pr_from_changes,
    get_github_client_for_installation,
    get_installation_token,
)

router = APIRouter(prefix="/github", tags=["github"])


@router.post("/create-pr", response_model=CreatePRResponse)
async def create_pull_request(request: CreatePRRequest) -> CreatePRResponse:
    """Create a GitHub pull request from local directory changes.

    This endpoint commits changes in a local git repository and creates
    a pull request on GitHub using GitHub App authentication.

    Args:
        request: Pull request creation parameters

    Returns:
        Pull request URL and metadata

    Raises:
        HTTPException: If PR creation fails
    """
    from app.core.log_config import logger

    logger.info(f"Creating PR for working directory: {request.working_directory}")

    try:
        # Get environment variables
        app_id = os.getenv("GITHUB_APP_ID")
        private_key_b64 = os.getenv("GITHUB_APP_PRIVATE_KEY_B64")

        logger.info(f"App ID: {app_id}")
        logger.info(f"Private key configured: {bool(private_key_b64)}")

        if not app_id or not private_key_b64:
            logger.error("GitHub App credentials not configured")
            raise HTTPException(
                status_code=500,
                detail="GitHub App credentials not configured"
            )

        # Extract repo from working directory (assuming it's a git repo with origin)
        work_dir = Path(request.working_directory)
        logger.info(f"Working directory: {work_dir}")
        if not work_dir.exists():
            logger.error(f"Working directory does not exist: {request.working_directory}")
            raise HTTPException(
                status_code=400,
                detail=f"Working directory does not exist: {request.working_directory}"
            )

        # Get repo from git remote
        logger.info("Running git remote get-url origin")
        result = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            cwd=work_dir,
            capture_output=True,
            text=True,
            check=True
        )
        remote_url = result.stdout.strip()
        logger.info(f"Remote URL: {remote_url}")

        # Extract owner/repo from URL
        if "github.com/" in remote_url:
            repo_part = remote_url.split("github.com/")[-1]
            if repo_part.endswith(".git"):
                repo_part = repo_part[:-4]
            repo = repo_part
            logger.info(f"Extracted repo: {repo}")
        else:
            logger.error("Working directory is not a GitHub repository")
            raise HTTPException(
                status_code=400,
                detail="Working directory is not a GitHub repository"
            )

        # Get installation token
        logger.info(f"Getting installation token for app {app_id} and repo {repo}")
        installation_token = get_installation_token(
            int(app_id),
            private_key_b64,
            repo
        )
        logger.info("Installation token obtained")

        # Create GitHub client
        logger.info("Creating GitHub client")
        github_client = get_github_client_for_installation(installation_token)
        logger.info("GitHub client created")

        # Create PR
        logger.info("Creating PR from changes")
        pr_url = create_pr_from_changes(
            request.working_directory,
            request.body,
            github_client,
            repo,
            installation_token
        )
        logger.info(f"PR created: {pr_url}")

        return CreatePRResponse(pr_url=pr_url)

    except subprocess.CalledProcessError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Git operation failed: {e.stderr}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to create pull request: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create pull request: {str(e)}"
        )
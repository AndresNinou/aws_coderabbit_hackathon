"""GitHub App integration utilities for PR creation."""

import base64
import os
import subprocess
import time
from pathlib import Path

import jwt
from github import Auth, Github, GithubIntegration


def create_app_jwt(app_id: int, private_key_pem: str) -> str:
    """Create a JWT for GitHub App authentication.

    Args:
        app_id: GitHub App ID
        private_key_pem: Private key in PEM format

    Returns:
        JWT token for app authentication
    """
    now = int(time.time())
    payload = {
        "iat": now,
        "exp": now + (10 * 60),  # 10 minutes
        "iss": app_id,
    }
    return jwt.encode(payload, private_key_pem, algorithm="RS256")


def get_installation_token(app_id: int, private_key_b64: str, repo: str) -> str:
    """Get installation token for a repository.

    Args:
        app_id: GitHub App ID
        private_key_b64: Base64 encoded private key
        repo: Repository in format "owner/repo"

    Returns:
        Installation token for API calls
    """
    private_key_pem = base64.b64decode(private_key_b64).decode("utf-8")
    auth = Auth.AppAuth(app_id, private_key_pem)

    # Create GitHub integration client
    gi = GithubIntegration(auth=auth)

    # Get installation for the repo
    owner, repo_name = repo.split("/")
    installation = gi.get_repo_installation(owner, repo_name)

    # Get access token
    access_token = gi.get_access_token(installation.id)
    return access_token.token


def get_github_client_for_installation(installation_token: str) -> Github:
    """Create GitHub client with installation token.

    Args:
        installation_token: Token from get_installation_token

    Returns:
        Authenticated GitHub client
    """
    return Github(installation_token)


def create_pr_from_changes(
    working_directory: str,
    body: str,
    github_client: Github,
    repo: str,
    installation_token: str
) -> str:
    """Create a pull request from local changes.

    Args:
        working_directory: Local git repository path
        body: PR description
        github_client: Authenticated GitHub client
        repo: Repository in format "owner/repo"

    Returns:
        Pull request URL
    """
    work_dir = Path(working_directory)
    if not work_dir.exists() or not work_dir.is_dir():
        raise ValueError(f"Working directory does not exist: {working_directory}")

    # Check if it's a git repo
    if not (work_dir / ".git").exists():
        raise ValueError(f"Not a git repository: {working_directory}")

    # Check for uncommitted changes
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=work_dir,
        capture_output=True,
        text=True,
        check=True
    )

    has_uncommitted_changes = bool(result.stdout.strip())

    # Get current branch
    result = subprocess.run(
        ["git", "branch", "--show-current"],
        cwd=work_dir,
        capture_output=True,
        text=True,
        check=True
    )
    current_branch = result.stdout.strip()

    if current_branch == "main" or current_branch == "master":
        raise ValueError("Cannot create PR from main/master branch")

    # Get default branch
    result = subprocess.run(
        ["git", "symbolic-ref", "refs/remotes/origin/HEAD"],
        cwd=work_dir,
        capture_output=True,
        text=True
    )
    if result.returncode == 0:
        default_branch = result.stdout.strip().split("/")[-1]
    else:
        # Fallback to common defaults
        result = subprocess.run(
            ["git", "branch", "-r"],
            cwd=work_dir,
            capture_output=True,
            text=True,
            check=True
        )
        remote_branches = result.stdout.strip().split("\n")
        if "origin/main" in remote_branches:
            default_branch = "main"
        elif "origin/master" in remote_branches:
            default_branch = "master"
        else:
            default_branch = "main"

    # Commit changes if there are uncommitted changes
    if has_uncommitted_changes:
        subprocess.run(["git", "add", "."], cwd=work_dir, check=True)

        author_name = os.getenv("GIT_DEFAULT_AUTHOR_NAME", "Security Agent Bot")
        author_email = os.getenv("GIT_DEFAULT_AUTHOR_EMAIL", "bot@example.com")

        env = os.environ.copy()
        env.update({
            "GIT_AUTHOR_NAME": author_name,
            "GIT_AUTHOR_EMAIL": author_email,
            "GIT_COMMITTER_NAME": author_name,
            "GIT_COMMITTER_EMAIL": author_email,
        })

        commit_message = f"Security fixes\n\n{body}"
        subprocess.run(
            ["git", "commit", "-m", commit_message],
            cwd=work_dir,
            env=env,
            check=True
        )

    # Push to remote using token (always push the current branch)
    remote_url = f"https://x-access-token:{installation_token}@github.com/{repo}.git"
    subprocess.run(
        ["git", "remote", "set-url", "origin", remote_url],
        cwd=work_dir,
        check=True
    )
    subprocess.run(
        ["git", "push", "origin", current_branch],
        cwd=work_dir,
        check=True
    )

    # Create PR
    owner, repo_name = repo.split("/")
    repository = github_client.get_repo(f"{owner}/{repo_name}")

    pr_title = f"Security fixes - {current_branch}"
    pr = repository.create_pull(
        title=pr_title,
        body=body,
        head=current_branch,
        base=default_branch
    )

    return pr.html_url
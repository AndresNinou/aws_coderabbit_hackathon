"""Pydantic models for GitHub API request/response validation."""

from pydantic import BaseModel, Field


class CreatePRRequest(BaseModel):
    """Request model for creating a GitHub pull request."""

    working_directory: str = Field(
        ...,
        description="Local directory path containing the git repository with changes to commit and push"
    )
    body: str = Field(
        ...,
        description="Pull request body/description in Markdown format"
    )


class CreatePRResponse(BaseModel):
    """Response model for pull request creation."""

    pr_url: str = Field(
        ...,
        description="URL of the created GitHub pull request"
    )
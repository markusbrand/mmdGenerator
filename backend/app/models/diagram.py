# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Diagram domain models."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# Max diagram content size (1 MB) to limit request body and DoS risk
MMD_CONTENT_MAX_LENGTH = 1_048_576


class DiagramCreate(BaseModel):
    """Payload to create a new diagram."""

    title: str = Field(..., min_length=1, max_length=255)
    mmd_content: str = Field(default="", max_length=MMD_CONTENT_MAX_LENGTH)


class DiagramUpdate(BaseModel):
    """Payload to update an existing diagram."""

    title: str | None = Field(None, min_length=1, max_length=255)
    mmd_content: str | None = Field(None, max_length=MMD_CONTENT_MAX_LENGTH)


class DiagramResponse(BaseModel):
    """Diagram as returned by the API."""

    id: UUID
    title: str
    mmd_content: str
    created_at: datetime | str  # ISO from DB or datetime
    updated_at: datetime | str

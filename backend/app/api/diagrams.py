# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Diagram CRUD API."""
import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.models.diagram import DiagramCreate, DiagramResponse, DiagramUpdate
from app.services.diagram_service import get_diagram_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/diagrams", tags=["diagrams"])


@router.get("", response_model=list[dict])
async def list_diagrams() -> list[dict]:
    """List all diagrams (id, title, created_at, updated_at)."""
    service = get_diagram_service()
    items = await service.list_diagrams()
    # Normalize for JSON (id stays string for frontend)
    return [
        {
            "id": r["id"],
            "title": r["title"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"],
        }
        for r in items
    ]


@router.post("", response_model=DiagramResponse, status_code=status.HTTP_201_CREATED)
async def create_diagram(payload: DiagramCreate) -> DiagramResponse:
    """Create a new diagram."""
    service = get_diagram_service()
    diagram = await service.create_diagram(payload)
    return DiagramResponse(
        id=UUID(diagram["id"]) if isinstance(diagram["id"], str) else diagram["id"],
        title=diagram["title"],
        mmd_content=diagram["mmd_content"],
        created_at=diagram["created_at"],
        updated_at=diagram["updated_at"],
    )


@router.get("/{diagram_id}", response_model=DiagramResponse)
async def get_diagram(diagram_id: UUID) -> DiagramResponse:
    """Get a single diagram by id."""
    service = get_diagram_service()
    diagram = await service.get_diagram(diagram_id)
    if diagram is None:
        logger.warning("Diagram not found: %s", diagram_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagram not found")
    return DiagramResponse(
        id=UUID(diagram["id"]) if isinstance(diagram["id"], str) else diagram["id"],
        title=diagram["title"],
        mmd_content=diagram["mmd_content"],
        created_at=diagram["created_at"],
        updated_at=diagram["updated_at"],
    )


@router.put("/{diagram_id}", response_model=DiagramResponse)
async def update_diagram(diagram_id: UUID, payload: DiagramUpdate) -> DiagramResponse:
    """Update a diagram."""
    service = get_diagram_service()
    diagram = await service.update_diagram(diagram_id, payload)
    if diagram is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagram not found")
    return DiagramResponse(
        id=UUID(diagram["id"]) if isinstance(diagram["id"], str) else diagram["id"],
        title=diagram["title"],
        mmd_content=diagram["mmd_content"],
        created_at=diagram["created_at"],
        updated_at=diagram["updated_at"],
    )


@router.delete("/{diagram_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagram(diagram_id: UUID) -> None:
    """Delete a diagram."""
    service = get_diagram_service()
    deleted = await service.delete_diagram(diagram_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Diagram not found")

# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Export diagram (SVG from frontend) to PNG and PDF."""
import logging

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.services.export_service import export_pdf, export_png

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/export", tags=["export"])


class ExportPngBody(BaseModel):
    """Request body for PNG export."""

    svg: str = Field(..., min_length=1)
    scale: int = Field(default=2, ge=1, le=4)


class ExportPdfBody(BaseModel):
    """Request body for PDF export."""

    svg: str = Field(..., min_length=1)


@router.post("/png")
async def export_png_endpoint(body: ExportPngBody) -> Response:
    """Convert SVG to high-resolution PNG and return as download."""
    try:
        png_bytes = export_png(body.svg, body.scale)
    except ValueError as e:
        logger.warning("Export PNG validation failed: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={"Content-Disposition": "attachment; filename=diagram.png"},
    )


@router.post("/pdf")
async def export_pdf_endpoint(body: ExportPdfBody) -> Response:
    """Convert SVG to PDF and return as download."""
    try:
        pdf_bytes = export_pdf(body.svg)
    except ValueError as e:
        logger.warning("Export PDF validation failed: %s", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=diagram.pdf"},
    )

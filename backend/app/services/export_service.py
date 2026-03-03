# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Export SVG to high-resolution PNG and PDF using cairosvg."""
import logging
import re
from io import BytesIO

import cairosvg

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Strip script/href to reduce XSS surface when re-rendering SVG from client
SCRIPT_OR_HREF = re.compile(r"<(script|a\s[^>]*\bhref\s*=)[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)


def _sanitize_svg(svg: str) -> str:
    """Remove script and href from SVG string (allowlist approach)."""
    return SCRIPT_OR_HREF.sub("", svg)


def export_png(svg: str, scale: int = 2) -> bytes:
    """Convert SVG to PNG bytes. Scale multiplies resolution (e.g. 2 = 2x)."""
    settings = get_settings()
    if len(svg.encode("utf-8")) > settings.export_max_svg_bytes:
        raise ValueError("SVG payload exceeds maximum size")
    scale = min(max(1, scale), settings.export_scale_max)
    sanitized = _sanitize_svg(svg)
    buf = BytesIO()
    try:
        cairosvg.svg2png(bytestring=sanitized.encode("utf-8"), write_to=buf, scale=scale)
    except Exception as e:
        logger.exception("PNG export failed: %s", e)
        raise ValueError("SVG could not be converted to PNG") from e
    return buf.getvalue()


def export_pdf(svg: str) -> bytes:
    """Convert SVG to PDF bytes."""
    settings = get_settings()
    if len(svg.encode("utf-8")) > settings.export_max_svg_bytes:
        raise ValueError("SVG payload exceeds maximum size")
    sanitized = _sanitize_svg(svg)
    buf = BytesIO()
    try:
        cairosvg.svg2pdf(bytestring=sanitized.encode("utf-8"), write_to=buf)
    except Exception as e:
        logger.exception("PDF export failed: %s", e)
        raise ValueError("SVG could not be converted to PDF") from e
    return buf.getvalue()

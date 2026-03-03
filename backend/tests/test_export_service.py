# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
import pytest

from app.services.export_service import export_pdf, export_png


def test_export_png_simple_svg() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="blue"/>
    </svg>"""
    out = export_png(svg, scale=1)
    assert isinstance(out, bytes)
    assert len(out) > 0
    assert out[:8] == b"\x89PNG\r\n\x1a\n"


def test_export_png_scale() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>"""
    out1 = export_png(svg, scale=1)
    out2 = export_png(svg, scale=2)
    assert len(out2) > len(out1)


def test_export_pdf_simple_svg() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <rect width="100" height="100" fill="red"/>
    </svg>"""
    out = export_pdf(svg)
    assert isinstance(out, bytes)
    assert out[:4] == b"%PDF"


def test_export_png_strips_script() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
      <script>alert(1)</script>
      <rect width="10" height="10"/>
    </svg>"""
    out = export_png(svg, scale=1)
    assert len(out) > 0


def test_export_png_too_large_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    from app.core.config import get_settings
    from app.services import export_service
    real = get_settings()
    monkeypatch.setattr(real, "export_max_svg_bytes", 10)
    monkeypatch.setattr(export_service, "get_settings", lambda: real)
    svg = "x" * 20
    with pytest.raises(ValueError, match="exceeds maximum"):
        export_png(svg)


def test_export_png_svg_with_text_and_font() -> None:
    """Export SVG with text and font-family (e.g. from Mermaid) so text is visible in PNG."""
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80">
      <style>.label { font-family: "Open Sans", sans-serif; font-size: 14px; }</style>
      <rect x="10" y="10" width="180" height="60" fill="#f0f0f0"/>
      <text x="100" y="45" class="label" text-anchor="middle">Hello</text>
    </svg>"""
    out = export_png(svg, scale=1)
    assert isinstance(out, bytes)
    assert len(out) > 0
    assert out[:8] == b"\x89PNG\r\n\x1a\n"


def test_export_pdf_svg_with_text_and_font() -> None:
    """Export SVG with text and font-family so text is visible in PDF."""
    svg = """<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80">
      <style>.label { font-family: Arial, sans-serif; }</style>
      <text x="20" y="40">Diagram</text>
    </svg>"""
    out = export_pdf(svg)
    assert isinstance(out, bytes)
    assert out[:4] == b"%PDF"

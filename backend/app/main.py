# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""FastAPI application: diagrams API and export; serves frontend static in production."""
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.logging_config import setup_logging
from app.api import diagrams, export

setup_logging()

app = FastAPI(
    title="mmdGenerator",
    description="Mermaid diagram editor and exporter",
    version="0.1.0",
)

settings = get_settings()
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(diagrams.router)
app.include_router(export.router)


@app.get("/health")
def health() -> dict:
    """Health check for probes."""
    return {"status": "ok"}


# Mount frontend static files when running in production (static built into image)
static_path = os.environ.get("MMD_STATIC_PATH")
if static_path and os.path.isdir(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")

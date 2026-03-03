# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Application configuration from environment."""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """App settings; env vars override defaults."""

    model_config = SettingsConfigDict(env_prefix="MMD_", env_file=".env", extra="ignore")

    # Data and storage
    data_dir: Path = Path("data")
    diagrams_dir_name: str = "diagrams"

    # Export limits (security)
    export_max_svg_bytes: int = 2 * 1024 * 1024  # 2 MB
    export_scale_max: int = 4

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "*"  # comma-separated; use specific origins in production


def get_settings() -> Settings:
    return Settings()

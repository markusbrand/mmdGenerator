# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Logging configuration with rolling file appender: max 40 MB, retain up to 2 weeks."""
import logging
import os
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

# Max total log size ~40 MB: 10 MB per file, 4 backup files
LOG_MAX_BYTES = 10 * 1024 * 1024
LOG_BACKUP_COUNT = 4
LOG_DIR = os.environ.get("LOG_DIR", "logs")
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()


def setup_logging() -> None:
    """Configure root logger with console and rotating file handler."""
    os.makedirs(LOG_DIR, exist_ok=True)
    log_file = os.path.join(LOG_DIR, "app.log")

    root = logging.getLogger()
    root.setLevel(LOG_LEVEL)
    if root.handlers:
        root.handlers.clear()

    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Console: errors and important messages visible
    console = logging.StreamHandler()
    console.setLevel(LOG_LEVEL)
    console.setFormatter(fmt)
    root.addHandler(console)

    # File: rotating, max 40 MB total (10 MB x 4)
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=LOG_MAX_BYTES,
        backupCount=LOG_BACKUP_COUNT,
        encoding="utf-8",
    )
    file_handler.setLevel(LOG_LEVEL)
    file_handler.setFormatter(fmt)
    root.addHandler(file_handler)

    # Reduce noise from third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

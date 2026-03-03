# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Diagram persistence: one .mmd content per diagram, stored in SQLite."""
import logging
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID, uuid4

import aiosqlite

from app.core.config import get_settings
from app.models.diagram import DiagramCreate, DiagramUpdate

logger = logging.getLogger(__name__)


class DiagramService:
    """CRUD for diagrams; one mmd file (content) per diagram."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._data_dir = self._settings.data_dir / self._settings.diagrams_dir_name
        self._db_path = self._settings.data_dir / "diagrams.db"

    async def _ensure_init(self) -> None:
        self._settings.data_dir.mkdir(parents=True, exist_ok=True)
        async with aiosqlite.connect(self._db_path) as db:
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS diagrams (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    mmd_content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
                """
            )
            await db.commit()

    async def list_diagrams(self) -> list[dict]:
        """Return list of diagrams (id, title, created_at, updated_at)."""
        await self._ensure_init()
        async with aiosqlite.connect(self._db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT id, title, created_at, updated_at FROM diagrams ORDER BY updated_at DESC"
            ) as cur:
                rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def get_diagram(self, diagram_id: UUID) -> dict | None:
        """Get a single diagram by id."""
        await self._ensure_init()
        async with aiosqlite.connect(self._db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(
                "SELECT id, title, mmd_content, created_at, updated_at FROM diagrams WHERE id = ?",
                (str(diagram_id),),
            ) as cur:
                row = await cur.fetchone()
        if row is None:
            return None
        return dict(row)

    async def create_diagram(self, payload: DiagramCreate) -> dict:
        """Create a new diagram; returns full diagram dict."""
        await self._ensure_init()
        diagram_id = uuid4()
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self._db_path) as db:
            await db.execute(
                "INSERT INTO diagrams (id, title, mmd_content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
                (str(diagram_id), payload.title, payload.mmd_content, now, now),
            )
            await db.commit()
        logger.info("Created diagram id=%s title=%s", diagram_id, payload.title)
        return {
            "id": diagram_id,
            "title": payload.title,
            "mmd_content": payload.mmd_content,
            "created_at": now,
            "updated_at": now,
        }

    async def update_diagram(self, diagram_id: UUID, payload: DiagramUpdate) -> dict | None:
        """Update diagram; returns updated diagram dict or None if not found."""
        await self._ensure_init()
        existing = await self.get_diagram(diagram_id)
        if existing is None:
            return None
        title = payload.title if payload.title is not None else existing["title"]
        mmd_content = payload.mmd_content if payload.mmd_content is not None else existing["mmd_content"]
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(self._db_path) as db:
            await db.execute(
                "UPDATE diagrams SET title = ?, mmd_content = ?, updated_at = ? WHERE id = ?",
                (title, mmd_content, now, str(diagram_id)),
            )
            await db.commit()
        logger.info("Updated diagram id=%s", diagram_id)
        return {
            "id": diagram_id,
            "title": title,
            "mmd_content": mmd_content,
            "created_at": existing["created_at"],
            "updated_at": now,
        }

    async def delete_diagram(self, diagram_id: UUID) -> bool:
        """Delete diagram; returns True if deleted."""
        await self._ensure_init()
        async with aiosqlite.connect(self._db_path) as db:
            cur = await db.execute("DELETE FROM diagrams WHERE id = ?", (str(diagram_id),))
            await db.commit()
            return cur.rowcount > 0


def get_diagram_service() -> DiagramService:
    return DiagramService()

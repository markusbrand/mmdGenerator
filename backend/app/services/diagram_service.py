# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
"""Diagram persistence: one .mmd content per diagram, stored in SQLite."""
import logging
from datetime import datetime, timezone
from uuid import UUID, uuid4

import aiosqlite

from app.core.config import get_settings
from app.models.diagram import DiagramCreate, DiagramUpdate

logger = logging.getLogger(__name__)


class DiagramService:
    """CRUD for diagrams; one mmd file (content) per diagram."""

    _db: aiosqlite.Connection | None = None

    def __init__(self) -> None:
        self._settings = get_settings()
        self._db_path = self._settings.data_dir / "diagrams.db"

    async def connect(self) -> None:
        """Initialize database connection and schema."""
        if self._db is not None:
            return

        self._settings.data_dir.mkdir(parents=True, exist_ok=True)
        self._db = await aiosqlite.connect(self._db_path)
        self._db.row_factory = aiosqlite.Row

        await self._db.execute(
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
        await self._db.commit()
        logger.info("Connected to database at %s", self._db_path)

    async def disconnect(self) -> None:
        """Close database connection."""
        if self._db is not None:
            await self._db.close()
            self._db = None
            logger.info("Disconnected from database")

    def _get_db(self) -> aiosqlite.Connection:
        if self._db is None:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._db

    async def list_diagrams(self) -> list[dict]:
        """Return list of diagrams (id, title, created_at, updated_at)."""
        db = self._get_db()
        async with db.execute(
            "SELECT id, title, created_at, updated_at FROM diagrams ORDER BY updated_at DESC"
        ) as cur:
            rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def get_diagram(self, diagram_id: UUID) -> dict | None:
        """Get a single diagram by id."""
        db = self._get_db()
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
        db = self._get_db()
        diagram_id = uuid4()
        now = datetime.now(timezone.utc).isoformat()
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
        db = self._get_db()
        existing = await self.get_diagram(diagram_id)
        if existing is None:
            return None
        title = payload.title if payload.title is not None else existing["title"]
        mmd_content = payload.mmd_content if payload.mmd_content is not None else existing["mmd_content"]
        now = datetime.now(timezone.utc).isoformat()
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
        db = self._get_db()
        cur = await db.execute("DELETE FROM diagrams WHERE id = ?", (str(diagram_id),))
        await db.commit()
        return cur.rowcount > 0


_diagram_service_instance: DiagramService | None = None


def get_diagram_service() -> DiagramService:
    global _diagram_service_instance
    if _diagram_service_instance is None:
        _diagram_service_instance = DiagramService()
    return _diagram_service_instance

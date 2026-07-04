# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
import pytest
from uuid import uuid4
from app.services.diagram_service import DiagramService
from app.models.diagram import DiagramCreate, DiagramUpdate
from app.core.config import Settings

@pytest.mark.asyncio
async def test_diagram_service_crud(tmp_path):
    settings = Settings()
    settings.data_dir = tmp_path
    service = DiagramService()
    service._settings = settings
    service._db_path = tmp_path / "diagrams.db"
    service._db = None
    await service.connect()

    try:
        # Create
        payload = DiagramCreate(title="Test", mmd_content="graph LR\nA-->B")
        created = await service.create_diagram(payload)
        assert created["title"] == "Test"
        diagram_id = created["id"]

        # List
        items = await service.list_diagrams()
        assert len(items) == 1
        assert items[0]["id"] == str(diagram_id)

        # Get
        fetched = await service.get_diagram(diagram_id)
        assert fetched is not None
        assert fetched["title"] == "Test"

        # Update
        update_payload = DiagramUpdate(title="Updated Title")
        updated = await service.update_diagram(diagram_id, update_payload)
        assert updated is not None
        assert updated["title"] == "Updated Title"
        assert updated["mmd_content"] == "graph LR\nA-->B"

        # Delete
        deleted = await service.delete_diagram(diagram_id)
        assert deleted is True

        # List empty
        items = await service.list_diagrams()
        assert len(items) == 0
    finally:
        await service.disconnect()

@pytest.mark.asyncio
async def test_get_nonexistent_diagram(tmp_path):
    settings = Settings()
    settings.data_dir = tmp_path
    service = DiagramService()
    service._settings = settings
    service._db_path = tmp_path / "diagrams.db"
    service._db = None
    await service.connect()
    try:
        res = await service.get_diagram(uuid4())
        assert res is None
    finally:
        await service.disconnect()

@pytest.mark.asyncio
async def test_update_nonexistent_diagram(tmp_path):
    settings = Settings()
    settings.data_dir = tmp_path
    service = DiagramService()
    service._settings = settings
    service._db_path = tmp_path / "diagrams.db"
    service._db = None
    await service.connect()
    try:
        res = await service.update_diagram(uuid4(), DiagramUpdate(title="New"))
        assert res is None
    finally:
        await service.disconnect()

@pytest.mark.asyncio
async def test_delete_nonexistent_diagram(tmp_path):
    settings = Settings()
    settings.data_dir = tmp_path
    service = DiagramService()
    service._settings = settings
    service._db_path = tmp_path / "diagrams.db"
    service._db = None
    await service.connect()
    try:
        res = await service.delete_diagram(uuid4())
        assert res is False
    finally:
        await service.disconnect()

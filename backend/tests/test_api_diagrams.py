# Copyright 2025 mmdGenerator Contributors. Licensed under the Apache License 2.0.
import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("MMD_DATA_DIR", str(tmp_path))
    from app.main import app
    return TestClient(app)


def test_create_and_get_diagram(client: TestClient) -> None:
    resp = client.post("/api/diagrams", json={"title": "Test", "mmd_content": "graph LR\n  A-->B"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Test"
    assert data["mmd_content"] == "graph LR\n  A-->B"
    diagram_id = data["id"]

    resp2 = client.get(f"/api/diagrams/{diagram_id}")
    assert resp2.status_code == 200
    assert resp2.json()["title"] == "Test"


def test_list_diagrams_empty(client: TestClient) -> None:
    resp = client.get("/api/diagrams")
    assert resp.status_code == 200
    assert resp.json() == []


def test_health(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}

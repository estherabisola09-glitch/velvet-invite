from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Velvet Invite API"
    assert data["version"] == "0.1.0"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["app"] == "Velvet Invite API"
    assert "database" in data
    assert "ai_service" in data
    assert data["ai_service"]["provider"] == "anthropic"

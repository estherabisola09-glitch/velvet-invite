from types import SimpleNamespace
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app import main
from app.routes import auth
from app.routes.auth import SignupRequest

client = TestClient(main.app)


def test_signup_accepts_password_with_required_character_types():
    request = SignupRequest(
        name="Test User",
        email="test@example.com",
        password="Goodpass1!",
        confirm_password="Goodpass1!",
    )

    assert request.password == "Goodpass1!"


@pytest.mark.parametrize(
    "password",
    [
        "Short1!",
        "lowercase1!",
        "UPPERCASE1!",
        "NoSymbol123",
        "Space IsNotASymbol1",
    ],
)
def test_signup_rejects_passwords_missing_requirements(password):
    with pytest.raises(ValidationError):
        SignupRequest(
            name="Test User",
            email="test@example.com",
            password=password,
            confirm_password=password,
        )


def test_google_signin_requests_only_identity_and_email(monkeypatch):
    monkeypatch.setattr(auth, "google_oauth_is_configured", lambda: True)
    monkeypatch.setattr(
        auth,
        "get_settings",
        lambda: SimpleNamespace(
            GOOGLE_CLIENT_ID="test-client-id",
            GOOGLE_CLIENT_SECRET="test-client-secret",
            GOOGLE_REDIRECT_URI="http://localhost:8000/api/auth/google/callback",
            JWT_SECRET="test-secret",
            JWT_ALGORITHM="HS256",
        ),
    )

    response = client.get("/api/auth/google", follow_redirects=False)
    scopes = parse_qs(urlparse(response.headers["location"]).query)["scope"][0].split()

    assert response.status_code == 303
    assert scopes == ["openid", "email"]

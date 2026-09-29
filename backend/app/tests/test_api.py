import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "TEMPORA" in data["service"]

def test_categories_endpoint():
    response = client.get("/api/listings/categories/all")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) > 0
    slugs = [c["slug"] for c in categories]
    assert "furniture" in slugs or "electronics" in slugs

def test_get_listings():
    response = client.get("/api/listings?limit=10")
    assert response.status_code == 200
    listings = response.json()
    assert isinstance(listings, list)
    assert len(listings) > 0
    assert "title" in listings[0]
    assert "price_per_day" in listings[0]

def test_search_marketplace():
    response = client.get("/api/search?q=desk&limit=5")
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)

def test_ai_recommend_endpoint():
    payload = {
        "query": "I am moving to Chennai for 6 months and need a bed, study table and office chair under 5000",
        "latitude": 13.0827,
        "longitude": 80.2707
    }
    response = client.post("/api/ai/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total_monthly_cost" in data
    assert data["match_score"] >= 80

def test_ai_clothing_look():
    response = client.post("/api/ai/clothing-look?occasion=Job%20Interview")
    assert response.status_code == 200
    data = response.json()
    assert "look_title" in data
    assert "items" in data

def test_ai_furniture_home():
    response = client.post("/api/ai/furniture-home?home_type=1BHK&duration_months=6")
    assert response.status_code == 200
    data = response.json()
    assert "package_name" in data
    assert "total_monthly_rate" in data

def test_login_demo_users():
    # Test valid customer login
    response = client.post("/api/auth/login", json={
        "email": "customer@tempora.io",
        "password": "customer123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "customer@tempora.io"

    # Test invalid password
    bad_resp = client.post("/api/auth/login", json={
        "email": "customer@tempora.io",
        "password": "wrongpassword"
    })
    assert bad_resp.status_code == 401

def test_admin_protected_routes():
    # Without token, should fail with 401 or 403
    unauth_resp = client.get("/api/admin/dashboard")
    assert unauth_resp.status_code in [401, 403]

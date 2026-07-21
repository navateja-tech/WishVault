"""
Unit tests for the Products routes and metadata extraction services.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient
from fastapi import status


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    """Fixture to register a test user and return authorization headers."""
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "produser@univault.app",
            "username": "produser",
            "password": "password123",
        },
    )
    token = reg_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_extract_metadata_fallback(client: AsyncClient, auth_headers: dict):
    """Test metadata extraction returns graceful fallback on unreachable URL."""
    response = await client.post(
        "/api/v1/products/extract",
        headers=auth_headers,
        json={"url": "https://example-test-store.com/item-123"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["domain"] == "example-test-store.com"
    assert "Example-test-store" in data["website"]


@pytest.mark.asyncio
async def test_save_product_success(client: AsyncClient, auth_headers: dict):
    """Test saving a new product to library."""
    # Create a collection first
    col_res = await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Tech Gadgets"},
    )
    collection_id = col_res.json()["id"]

    # Save product
    response = await client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={
            "collection_id": collection_id,
            "title": "Wireless Noise Canceling Headphones",
            "url": "https://nike.com/headphones",
            "image_url": "https://nike.com/img.jpg",
            "website": "Nike",
            "domain": "nike.com",
            "price": 299.99,
            "currency": "USD",
            "notes": "Must buy during Black Friday sale",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Wireless Noise Canceling Headphones"
    assert data["collection_id"] == collection_id
    assert data["notes"] == "Must buy during Black Friday sale"

    # Verify collection product count updated
    col_check = await client.get(f"/api/v1/collections/{collection_id}", headers=auth_headers)
    assert col_check.json()["product_count"] == 1


@pytest.mark.asyncio
async def test_list_products(client: AsyncClient, auth_headers: dict):
    """Test listing saved products."""
    await client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={"title": "Item A", "url": "https://store.com/a"},
    )
    await client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={"title": "Item B", "url": "https://store.com/b"},
    )

    response = await client.get("/api/v1/products", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_get_product_by_id(client: AsyncClient, auth_headers: dict):
    """Test fetching single product details."""
    save_res = await client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={"title": "Ergonomic Desk", "url": "https://ikea.com/desk"},
    )
    prod_id = save_res.json()["id"]

    response = await client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Ergonomic Desk"


@pytest.mark.asyncio
async def test_update_product(client: AsyncClient, auth_headers: dict):
    """Test updating product notes and collection."""
    save_res = await client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={"title": "Smart Watch", "url": "https://apple.com/watch"},
    )
    prod_id = save_res.json()["id"]

    update_res = await client.patch(
        f"/api/v1/products/{prod_id}",
        headers=auth_headers,
        json={"notes": "Updated note: Priority purchase"},
    )
    assert update_res.status_code == status.HTTP_200_OK
    assert update_res.json()["notes"] == "Updated note: Priority purchase"


@pytest.mark.asyncio
async def test_delete_product(client: AsyncClient, auth_headers: dict):
    """Test deleting a product."""
    save_res = await client.post(
        "/api/v1/products",
        headers=auth_headers,
        json={"title": "Temp Item", "url": "https://store.com/temp"},
    )
    prod_id = save_res.json()["id"]

    del_res = await client.delete(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert del_res.status_code == status.HTTP_200_OK

    get_res = await client.get(f"/api/v1/products/{prod_id}", headers=auth_headers)
    assert get_res.status_code == status.HTTP_404_NOT_FOUND

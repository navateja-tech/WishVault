"""
Unit tests for the Collections routes and services.
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
            "email": "coluser@univault.app",
            "username": "coluser",
            "password": "password123",
        },
    )
    token = reg_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_create_collection_success(client: AsyncClient, auth_headers: dict):
    """Test creating a new collection."""
    response = await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={
            "name": "Gaming Setup",
            "icon": "gamepad",
            "color": "#F472B6",
            "sort_order": 1,
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Gaming Setup"
    assert data["icon"] == "gamepad"
    assert data["color"] == "#F472B6"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_duplicate_collection(client: AsyncClient, auth_headers: dict):
    """Test duplicate collection name for same user returns 409 conflict."""
    await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Fashion", "icon": "shirt", "color": "#FB923C"},
    )
    response = await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Fashion", "icon": "shirt", "color": "#FB923C"},
    )
    assert response.status_code == status.HTTP_409_CONFLICT


@pytest.mark.asyncio
async def test_list_collections(client: AsyncClient, auth_headers: dict):
    """Test listing user collections."""
    await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Alpha", "sort_order": 2},
    )
    await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Beta", "sort_order": 1},
    )

    response = await client.get("/api/v1/collections", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 2
    # Verify sort order
    assert data[0]["name"] == "Beta"
    assert data[1]["name"] == "Alpha"


@pytest.mark.asyncio
async def test_get_collection_by_id(client: AsyncClient, auth_headers: dict):
    """Test retrieving collection by ID."""
    create_res = await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Home Decor"},
    )
    col_id = create_res.json()["id"]

    response = await client.get(
        f"/api/v1/collections/{col_id}",
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Home Decor"


@pytest.mark.asyncio
async def test_update_collection(client: AsyncClient, auth_headers: dict):
    """Test updating collection properties."""
    create_res = await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Old Name", "color": "#60A5FA"},
    )
    col_id = create_res.json()["id"]

    update_res = await client.patch(
        f"/api/v1/collections/{col_id}",
        headers=auth_headers,
        json={"name": "New Name", "color": "#34D399"},
    )
    assert update_res.status_code == status.HTTP_200_OK
    data = update_res.json()
    assert data["name"] == "New Name"
    assert data["color"] == "#34D399"


@pytest.mark.asyncio
async def test_delete_collection(client: AsyncClient, auth_headers: dict):
    """Test deleting a collection."""
    create_res = await client.post(
        "/api/v1/collections",
        headers=auth_headers,
        json={"name": "Temporary"},
    )
    col_id = create_res.json()["id"]

    del_res = await client.delete(
        f"/api/v1/collections/{col_id}",
        headers=auth_headers,
    )
    assert del_res.status_code == status.HTTP_200_OK

    get_res = await client.get(
        f"/api/v1/collections/{col_id}",
        headers=auth_headers,
    )
    assert get_res.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.asyncio
async def test_unauthorized_collections_access(client: AsyncClient):
    """Test unauthenticated request returns 403 Forbidden."""
    response = await client.get("/api/v1/collections")
    assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

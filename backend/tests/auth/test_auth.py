"""
Unit tests for the Authentication routes and services.
"""
import pytest
from httpx import AsyncClient
from fastapi import status


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    """Test user registration behaves correctly."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@univault.app",
            "username": "testuser",
            "password": "strongpassword123",
            "full_name": "Test User",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test registering with an existing email raises conflict error."""
    # First registration
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "dup@univault.app",
            "username": "user1",
            "password": "password123",
        },
    )
    # Second registration with same email
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "dup@univault.app",
            "username": "user2",
            "password": "password123",
        },
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_duplicate_username(client: AsyncClient):
    """Test registering with an existing username raises conflict error."""
    # First registration
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user1@univault.app",
            "username": "dupuser",
            "password": "password123",
        },
    )
    # Second registration with same username
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "user2@univault.app",
            "username": "dupuser",
            "password": "password123",
        },
    )
    assert response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test user login returns active tokens."""
    # Register first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@univault.app",
            "username": "loginuser",
            "password": "correctpassword",
        },
    )
    # Attempt login
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "login@univault.app",
            "password": "correctpassword",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    """Test login with wrong password returns 401."""
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "wrongpass@univault.app",
            "username": "wrongpassuser",
            "password": "correctpassword",
        },
    )
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "wrongpass@univault.app",
            "password": "incorrectpassword",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_refresh_token_success(client: AsyncClient):
    """Test refresh token retrieves new access token."""
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "refresh@univault.app",
            "username": "refreshuser",
            "password": "password123",
        },
    )
    refresh_token = reg_response.json()["refresh_token"]

    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_get_profile_success(client: AsyncClient):
    """Test profile details retrieval with authorization headers."""
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "profile@univault.app",
            "username": "profileuser",
            "password": "password123",
            "full_name": "Profile Owner",
        },
    )
    token = reg_response.json()["access_token"]

    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == "profile@univault.app"
    assert data["username"] == "profileuser"
    assert data["full_name"] == "Profile Owner"


@pytest.mark.asyncio
async def test_update_profile_success(client: AsyncClient):
    """Test updating user profile info is reflected in next query."""
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "update@univault.app",
            "username": "updateuser",
            "password": "password123",
            "full_name": "Before Update",
        },
    )
    token = reg_response.json()["access_token"]

    update_response = await client.patch(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"full_name": "After Update", "avatar_url": "http://avatar.jpg"},
    )
    assert update_response.status_code == status.HTTP_200_OK
    data = update_response.json()
    assert data["full_name"] == "After Update"
    assert data["avatar_url"] == "http://avatar.jpg"

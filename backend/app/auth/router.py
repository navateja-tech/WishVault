"""
FastAPI route handlers for the Authentication and Profile domains.
"""
from fastapi import APIRouter, Depends, status

from app.core.dependencies import DbSession, CurrentUserId
from app.auth.schemas import (
    UserCreate,
    UserLogin,
    TokenResponse,
    TokenRefreshRequest,
    UserResponse,
    ProfileUpdateRequest,
)
from app.auth.service import AuthService
from app.common.schemas import MessageResponse

# Initialize router
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(user_data: UserCreate, session: DbSession):
    service = AuthService(session)
    return await service.register_user(user_data)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate credentials and retrieve active tokens",
)
async def login(credentials: UserLogin, session: DbSession):
    service = AuthService(session)
    return await service.login_user(credentials)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh session access token",
)
async def refresh(refresh_req: TokenRefreshRequest, session: DbSession):
    service = AuthService(session)
    return await service.refresh_tokens(refresh_req.refresh_token)


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Invalidate user session",
)
async def logout():
    # Since we are using stateless JWT tokens, client-side clearance is sufficient for MVP.
    # Future versions can introduce a token blacklist.
    return MessageResponse(message="Logged out successfully")


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve current user profile data",
)
async def get_me(user_id: CurrentUserId, session: DbSession):
    service = AuthService(session)
    return await service.get_profile(user_id)


@router.patch(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile data",
)
async def update_me(
    user_id: CurrentUserId,
    profile_data: ProfileUpdateRequest,
    session: DbSession,
):
    service = AuthService(session)
    return await service.update_profile(user_id, profile_data)

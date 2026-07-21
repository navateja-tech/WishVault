"""
Service class for coordinating User Business Logic.
"""
import uuid
import jwt as pyjwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repository import UserRepository
from app.auth.schemas import (
    UserCreate,
    UserLogin,
    TokenResponse,
    ProfileUpdateRequest,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.common.exceptions import (
    AlreadyExistsException,
    UnauthorizedException,
    NotFoundException,
)


class AuthService:
    """Orchestrates business logic for Authentication and Profile management."""

    def __init__(self, session: AsyncSession):
        self.repo = UserRepository(session)

    async def register_user(self, user_create: UserCreate) -> TokenResponse:
        """Register a new user and return active session tokens."""
        # Check if email is already registered
        existing_email = await self.repo.get_by_email(user_create.email)
        if existing_email:
            raise AlreadyExistsException("Email is already registered")

        # Check if username is already taken
        existing_username = await self.repo.get_by_username(user_create.username)
        if existing_username:
            raise AlreadyExistsException("Username is already taken")

        # Hash password and persist user
        hashed = hash_password(user_create.password)
        db_user = await self.repo.create(user_create, hashed)

        # Generate tokens
        user_id_str = str(db_user.id)
        return TokenResponse(
            access_token=create_access_token(user_id_str),
            refresh_token=create_refresh_token(user_id_str),
        )

    async def login_user(self, login_data: UserLogin) -> TokenResponse:
        """Authenticate user credentials and return active session tokens."""
        db_user = await self.repo.get_by_email(login_data.email)
        if not db_user:
            raise UnauthorizedException("Invalid email or password")

        if not verify_password(login_data.password, db_user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        # Generate tokens
        user_id_str = str(db_user.id)
        return TokenResponse(
            access_token=create_access_token(user_id_str),
            refresh_token=create_refresh_token(user_id_str),
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Validate refresh token and issue a new access/refresh token pair."""
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise UnauthorizedException("Invalid token type")

            user_id_str = payload.get("sub")
            if not user_id_str:
                raise UnauthorizedException("Invalid token payload")

            # Check if user still exists
            user_id = uuid.UUID(user_id_str)
            db_user = await self.repo.get_by_id(user_id)
            if not db_user:
                raise UnauthorizedException("User not found")

            # Generate fresh token pair
            return TokenResponse(
                access_token=create_access_token(user_id_str),
                refresh_token=create_refresh_token(user_id_str),
            )
        except pyjwt.ExpiredSignatureError:
            raise UnauthorizedException("Refresh token has expired")
        except pyjwt.InvalidTokenError:
            raise UnauthorizedException("Invalid refresh token")

    async def get_profile(self, user_id_str: str):
        """Fetch current user profile data."""
        user_id = uuid.UUID(user_id_str)
        db_user = await self.repo.get_by_id(user_id)
        if not db_user:
            raise NotFoundException("User")
        return db_user

    async def update_profile(self, user_id_str: str, update_req: ProfileUpdateRequest):
        """Update current user profile data."""
        user_id = uuid.UUID(user_id_str)
        db_user = await self.repo.get_by_id(user_id)
        if not db_user:
            raise NotFoundException("User")
        return await self.repo.update_profile(db_user, update_req)

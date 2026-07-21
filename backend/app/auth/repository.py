"""
Repository class for database operations on the Users table.
"""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User
from app.auth.schemas import UserCreate, ProfileUpdateRequest


class UserRepository:
    """Handles async database operations for Users."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Fetch user by primary key UUID."""
        return await self.session.get(User, user_id)

    async def get_by_email(self, email: str) -> User | None:
        """Fetch user by unique email."""
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalars().first()

    async def get_by_username(self, username: str) -> User | None:
        """Fetch user by unique username."""
        result = await self.session.execute(
            select(User).where(User.username == username)
        )
        return result.scalars().first()


    async def create(self, user_create: UserCreate, hashed_password: str) -> User:
        """Insert a new user into the database."""
        db_user = User(
            email=user_create.email,
            username=user_create.username,
            password_hash=hashed_password,
            full_name=user_create.full_name,
        )
        self.session.add(db_user)
        await self.session.flush()  # Populates UUID primary key
        return db_user

    async def update_profile(self, user: User, update_req: ProfileUpdateRequest) -> User:
        """Update user profile attributes."""
        if update_req.full_name is not None:
            user.full_name = update_req.full_name
        if update_req.avatar_url is not None:
            user.avatar_url = update_req.avatar_url
        await self.session.flush()
        return user

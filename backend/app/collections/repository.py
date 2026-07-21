"""
Repository for database operations on the Collections table.
"""
import uuid
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.collections.models import Collection
from app.collections.schemas import CollectionCreate, CollectionUpdate


class CollectionRepository:
    """Handles database queries for Collections."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID, collection_id: uuid.UUID) -> Collection | None:
        """Fetch a single collection owned by user."""
        stmt = select(Collection).where(
            and_(Collection.id == collection_id, Collection.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_name(self, user_id: uuid.UUID, name: str) -> Collection | None:
        """Fetch collection by user ID and name."""
        stmt = select(Collection).where(
            and_(Collection.user_id == user_id, Collection.name == name)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list_by_user(self, user_id: uuid.UUID) -> list[Collection]:
        """List all collections belonging to user, ordered by sort_order and name."""
        stmt = (
            select(Collection)
            .where(Collection.user_id == user_id)
            .order_by(Collection.sort_order.asc(), Collection.name.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, user_id: uuid.UUID, data: CollectionCreate) -> Collection:
        """Create a new collection."""
        collection = Collection(
            user_id=user_id,
            name=data.name,
            icon=data.icon,
            color=data.color,
            sort_order=data.sort_order,
        )
        self.session.add(collection)
        await self.session.flush()
        return collection

    async def update(self, collection: Collection, data: CollectionUpdate) -> Collection:
        """Update an existing collection."""
        if data.name is not None:
            collection.name = data.name
        if data.icon is not None:
            collection.icon = data.icon
        if data.color is not None:
            collection.color = data.color
        if data.sort_order is not None:
            collection.sort_order = data.sort_order
        await self.session.flush()
        return collection

    async def delete(self, collection: Collection) -> None:
        """Delete a collection."""
        await self.session.delete(collection)
        await self.session.flush()

"""
Service for orchestrating Collection business logic.
"""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.collections.repository import CollectionRepository
from app.products.repository import ProductRepository
from app.collections.schemas import CollectionCreate, CollectionUpdate, CollectionResponse
from app.common.exceptions import AlreadyExistsException, NotFoundException


class CollectionService:
    """Business service for Collections."""

    def __init__(self, session: AsyncSession):
        self.repo = CollectionRepository(session)
        self.product_repo = ProductRepository(session)

    async def list_collections(self, user_id_str: str) -> list[CollectionResponse]:
        user_id = uuid.UUID(user_id_str)
        collections = await self.repo.list_by_user(user_id)

        res = []
        for c in collections:
            count = await self.product_repo.count_by_collection(user_id, c.id)
            res.append(
                CollectionResponse(
                    id=c.id,
                    user_id=c.user_id,
                    name=c.name,
                    icon=c.icon,
                    color=c.color,
                    sort_order=c.sort_order,
                    product_count=count,
                    created_at=c.created_at,
                    updated_at=c.updated_at,
                )
            )
        return res

    async def create_collection(self, user_id_str: str, data: CollectionCreate) -> CollectionResponse:
        user_id = uuid.UUID(user_id_str)

        existing = await self.repo.get_by_name(user_id, data.name)
        if existing:
            raise AlreadyExistsException(f"Collection '{data.name}' already exists")

        c = await self.repo.create(user_id, data)
        return CollectionResponse(
            id=c.id,
            user_id=c.user_id,
            name=c.name,
            icon=c.icon,
            color=c.color,
            sort_order=c.sort_order,
            product_count=0,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )

    async def get_collection(self, user_id_str: str, collection_id_str: str) -> CollectionResponse:
        user_id = uuid.UUID(user_id_str)
        collection_id = uuid.UUID(collection_id_str)

        c = await self.repo.get_by_id(user_id, collection_id)
        if not c:
            raise NotFoundException("Collection")

        count = await self.product_repo.count_by_collection(user_id, c.id)
        return CollectionResponse(
            id=c.id,
            user_id=c.user_id,
            name=c.name,
            icon=c.icon,
            color=c.color,
            sort_order=c.sort_order,
            product_count=count,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )

    async def update_collection(
        self, user_id_str: str, collection_id_str: str, data: CollectionUpdate
    ) -> CollectionResponse:
        user_id = uuid.UUID(user_id_str)
        collection_id = uuid.UUID(collection_id_str)

        c = await self.repo.get_by_id(user_id, collection_id)
        if not c:
            raise NotFoundException("Collection")

        if data.name and data.name != c.name:
            existing = await self.repo.get_by_name(user_id, data.name)
            if existing:
                raise AlreadyExistsException(f"Collection '{data.name}' already exists")

        updated_c = await self.repo.update(c, data)
        count = await self.product_repo.count_by_collection(user_id, updated_c.id)
        return CollectionResponse(
            id=updated_c.id,
            user_id=updated_c.user_id,
            name=updated_c.name,
            icon=updated_c.icon,
            color=updated_c.color,
            sort_order=updated_c.sort_order,
            product_count=count,
            created_at=updated_c.created_at,
            updated_at=updated_c.updated_at,
        )

    async def delete_collection(self, user_id_str: str, collection_id_str: str) -> None:
        user_id = uuid.UUID(user_id_str)
        collection_id = uuid.UUID(collection_id_str)

        c = await self.repo.get_by_id(user_id, collection_id)
        if not c:
            raise NotFoundException("Collection")

        await self.repo.delete(c)

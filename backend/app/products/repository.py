"""
Repository for database operations on the Products table.
"""
import uuid
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.products.models import Product
from app.products.schemas import ProductCreate, ProductUpdate


class ProductRepository:
    """Handles async database operations for Products."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: uuid.UUID, product_id: uuid.UUID) -> Product | None:
        """Fetch product by ID owned by user."""
        stmt = select(Product).where(
            and_(Product.id == product_id, Product.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list_by_user(
        self,
        user_id: uuid.UUID,
        collection_id: uuid.UUID | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Product]:
        """List user products with optional collection filtering."""
        stmt = select(Product).where(Product.user_id == user_id)

        if collection_id is not None:
            stmt = stmt.where(Product.collection_id == collection_id)

        stmt = stmt.order_by(Product.created_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count_by_collection(self, user_id: uuid.UUID, collection_id: uuid.UUID) -> int:
        """Get product count in a collection."""
        stmt = select(func.count(Product.id)).where(
            and_(Product.user_id == user_id, Product.collection_id == collection_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def create(self, user_id: uuid.UUID, data: ProductCreate) -> Product:
        """Insert a new product."""
        product = Product(
            user_id=user_id,
            collection_id=data.collection_id,
            title=data.title,
            url=data.url,
            image_url=data.image_url,
            website=data.website,
            domain=data.domain,
            price=data.price,
            currency=data.currency,
            description=data.description,
            notes=data.notes,
            raw_metadata=data.raw_metadata,
        )
        self.session.add(product)
        await self.session.flush()
        return product

    async def update(self, product: Product, data: ProductUpdate) -> Product:
        """Update product notes or collection."""
        if data.notes is not None:
            product.notes = data.notes
        if data.collection_id is not None:
            product.collection_id = data.collection_id
        await self.session.flush()
        return product

    async def delete(self, product: Product) -> None:
        """Delete a product."""
        await self.session.delete(product)
        await self.session.flush()

"""
Service for orchestrating Product Business Logic.
"""
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.products.repository import ProductRepository
from app.products.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductExtractResponse,
)
from app.products.scraper.extractor import extract_product_metadata
from app.common.exceptions import NotFoundException


class ProductService:
    """Business service for Products."""

    def __init__(self, session: AsyncSession):
        self.repo = ProductRepository(session)

    async def extract_metadata(self, url: str) -> ProductExtractResponse:
        """Run metadata extraction pipeline on URL."""
        data = await extract_product_metadata(url)
        return ProductExtractResponse(
            title=data.get("title", "Product"),
            url=data.get("url", url),
            image_url=data.get("image_url"),
            website=data.get("website"),
            domain=data.get("domain"),
            price=data.get("price"),
            currency=data.get("currency", "USD"),
            description=data.get("description"),
        )

    async def list_products(
        self,
        user_id_str: str,
        collection_id_str: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[ProductResponse]:
        user_id = uuid.UUID(user_id_str)
        collection_id = uuid.UUID(collection_id_str) if collection_id_str else None

        products = await self.repo.list_by_user(user_id, collection_id, limit, offset)
        return [ProductResponse.model_validate(p) for p in products]

    async def save_product(self, user_id_str: str, data: ProductCreate) -> ProductResponse:
        user_id = uuid.UUID(user_id_str)
        product = await self.repo.create(user_id, data)
        return ProductResponse.model_validate(product)

    async def get_product(self, user_id_str: str, product_id_str: str) -> ProductResponse:
        user_id = uuid.UUID(user_id_str)
        product_id = uuid.UUID(product_id_str)

        product = await self.repo.get_by_id(user_id, product_id)
        if not product:
            raise NotFoundException("Product")
        return ProductResponse.model_validate(product)

    async def update_product(
        self, user_id_str: str, product_id_str: str, data: ProductUpdate
    ) -> ProductResponse:
        user_id = uuid.UUID(user_id_str)
        product_id = uuid.UUID(product_id_str)

        product = await self.repo.get_by_id(user_id, product_id)
        if not product:
            raise NotFoundException("Product")

        updated = await self.repo.update(product, data)
        return ProductResponse.model_validate(updated)

    async def delete_product(self, user_id_str: str, product_id_str: str) -> None:
        user_id = uuid.UUID(user_id_str)
        product_id = uuid.UUID(product_id_str)

        product = await self.repo.get_by_id(user_id, product_id)
        if not product:
            raise NotFoundException("Product")

        await self.repo.delete(product)

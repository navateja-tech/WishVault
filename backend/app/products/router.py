"""
FastAPI route handlers for Products domain.
"""
from fastapi import APIRouter, status, Query

from app.core.dependencies import DbSession, CurrentUserId
from app.products.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductExtractRequest,
    ProductExtractResponse,
)
from app.products.service import ProductService
from app.common.schemas import MessageResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "/extract",
    response_model=ProductExtractResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract OpenGraph, JSON-LD, and meta tags from product URL",
)
async def extract_metadata(
    request: ProductExtractRequest, user_id: CurrentUserId, session: DbSession
):
    service = ProductService(session)
    return await service.extract_metadata(request.url)


@router.get(
    "",
    response_model=list[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="List saved products for current user",
)
async def list_products(
    user_id: CurrentUserId,
    session: DbSession,
    collection_id: str | None = Query(None, description="Filter by collection ID"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    service = ProductService(session)
    return await service.list_products(user_id, collection_id, limit, offset)


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a product to library",
)
async def create_product(
    data: ProductCreate, user_id: CurrentUserId, session: DbSession
):
    service = ProductService(session)
    return await service.save_product(user_id, data)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get product details by ID",
)
async def get_product(
    product_id: str, user_id: CurrentUserId, session: DbSession
):
    service = ProductService(session)
    return await service.get_product(user_id, product_id)


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Update product notes or collection",
)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    user_id: CurrentUserId,
    session: DbSession,
):
    service = ProductService(session)
    return await service.update_product(user_id, product_id, data)


@router.delete(
    "/{product_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete product from library",
)
async def delete_product(
    product_id: str, user_id: CurrentUserId, session: DbSession
):
    service = ProductService(session)
    await service.delete_product(user_id, product_id)
    return MessageResponse(message="Product deleted successfully")

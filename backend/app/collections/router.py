"""
FastAPI route handlers for Collections domain.
"""
from fastapi import APIRouter, status

from app.core.dependencies import DbSession, CurrentUserId
from app.collections.schemas import (
    CollectionCreate,
    CollectionUpdate,
    CollectionResponse,
)
from app.collections.service import CollectionService
from app.common.schemas import MessageResponse

router = APIRouter(prefix="/collections", tags=["Collections"])


@router.get(
    "",
    response_model=list[CollectionResponse],
    status_code=status.HTTP_200_OK,
    summary="List all collections for current user",
)
async def list_collections(user_id: CurrentUserId, session: DbSession):
    service = CollectionService(session)
    return await service.list_collections(user_id)


@router.post(
    "",
    response_model=CollectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new collection",
)
async def create_collection(
    data: CollectionCreate, user_id: CurrentUserId, session: DbSession
):
    service = CollectionService(session)
    return await service.create_collection(user_id, data)


@router.get(
    "/{collection_id}",
    response_model=CollectionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get collection details by ID",
)
async def get_collection(
    collection_id: str, user_id: CurrentUserId, session: DbSession
):
    service = CollectionService(session)
    return await service.get_collection(user_id, collection_id)


@router.patch(
    "/{collection_id}",
    response_model=CollectionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update collection",
)
async def update_collection(
    collection_id: str,
    data: CollectionUpdate,
    user_id: CurrentUserId,
    session: DbSession,
):
    service = CollectionService(session)
    return await service.update_collection(user_id, collection_id, data)


@router.delete(
    "/{collection_id}",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete collection",
)
async def delete_collection(
    collection_id: str, user_id: CurrentUserId, session: DbSession
):
    service = CollectionService(session)
    await service.delete_collection(user_id, collection_id)
    return MessageResponse(message="Collection deleted successfully")

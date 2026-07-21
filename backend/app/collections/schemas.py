"""
Pydantic schemas for the Collections domain.
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CollectionCreate(BaseModel):
    """Schema for creating a collection."""

    name: str = Field(..., min_length=1, max_length=255)
    icon: str = Field("folder", max_length=50)
    color: str = Field("#F472B6", max_length=7, pattern="^#[0-9a-fA-F]{6}$")
    sort_order: int = Field(0, ge=0)


class CollectionUpdate(BaseModel):
    """Schema for updating a collection."""

    name: str | None = Field(None, min_length=1, max_length=255)
    icon: str | None = Field(None, max_length=50)
    color: str | None = Field(None, max_length=7, pattern="^#[0-9a-fA-F]{6}$")
    sort_order: int | None = Field(None, ge=0)


class CollectionResponse(BaseModel):
    """Schema for collection details response."""

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    icon: str
    color: str
    sort_order: int
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

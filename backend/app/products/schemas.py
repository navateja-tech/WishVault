"""
Pydantic schemas for the Products domain.
"""
import uuid
from decimal import Decimal
from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, ConfigDict, HttpUrl


class ProductExtractRequest(BaseModel):
    """Schema for requesting URL metadata extraction."""

    url: str = Field(..., description="Product webpage URL")


class ProductExtractResponse(BaseModel):
    """Schema returning preview extracted metadata."""

    title: str
    url: str
    image_url: str | None = None
    website: str | None = None
    domain: str | None = None
    price: Decimal | None = None
    currency: str | None = "USD"
    description: str | None = None


class ProductCreate(BaseModel):
    """Schema for saving a product."""

    collection_id: uuid.UUID | None = None
    title: str = Field(..., min_length=1, max_length=500)
    url: str
    image_url: str | None = None
    website: str | None = None
    domain: str | None = None
    price: Decimal | None = None
    currency: str | None = "USD"
    description: str | None = None
    notes: str | None = None
    raw_metadata: dict[str, Any] = Field(default_factory=dict)


class ProductUpdate(BaseModel):
    """Schema for updating product notes or moving collection."""

    notes: str | None = None
    collection_id: uuid.UUID | None = None


class ProductResponse(BaseModel):
    """Schema for product details response."""

    id: uuid.UUID
    user_id: uuid.UUID
    collection_id: uuid.UUID | None = None
    title: str
    url: str
    image_url: str | None = None
    website: str | None = None
    domain: str | None = None
    price: Decimal | None = None
    currency: str | None = None
    description: str | None = None
    notes: str | None = None
    raw_metadata: dict[str, Any] = Field(default_factory=dict, serialization_alias="metadata")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

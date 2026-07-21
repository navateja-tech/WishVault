"""
SQLAlchemy database models for the Products domain.
"""
import uuid
from decimal import Decimal
from typing import Any
from sqlalchemy import String, Text, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.base_model import Base, TimestampMixin, UUIDMixin


class Product(Base, TimestampMixin, UUIDMixin):
    """Product model for saved items."""

    __tablename__ = "products"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    collection_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("collections.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    image_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    website: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    domain: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    price: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )
    currency: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True,
    )
    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    # Use JSON with JSONB fallback for PostgreSQL and SQLite test compatibility
    raw_metadata: Mapped[dict[str, Any]] = mapped_column(
        "metadata",
        JSON().with_variant(JSONB, "postgresql"),
        default=dict,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="products")
    collection: Mapped["Collection | None"] = relationship("Collection", back_populates="products")

    def __repr__(self) -> str:
        return f"<Product {self.title} ({self.domain})>"


# Index on created_at for fast recent products query
Index("idx_products_created_at", Product.created_at.desc())

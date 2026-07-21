"""
SQLAlchemy database models for the Collections domain.
"""
import uuid
from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.base_model import Base, TimestampMixin, UUIDMixin


class Collection(Base, TimestampMixin, UUIDMixin):
    """Collection model for organizing saved products."""

    __tablename__ = "collections"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_collections_user_id_name"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    icon: Mapped[str] = mapped_column(
        String(50),
        default="folder",
        nullable=False,
    )
    color: Mapped[str] = mapped_column(
        String(7),
        default="#F472B6",
        nullable=False,
    )
    sort_order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(back_populates="collections")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="collection")

    # products: Mapped[list["Product"]] = relationship(back_populates="collection", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Collection {self.name} ({self.id})>"

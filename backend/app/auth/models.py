"""
SQLAlchemy database models for the Authentication domain.
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.base_model import Base, TimestampMixin, Base as CommonBase, UUIDMixin


class User(Base, TimestampMixin, UUIDMixin):
    """User accounts table model."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )

    # Relationships
    collections: Mapped[list["Collection"]] = relationship(
        "Collection",
        back_populates="user",
        cascade="all, delete-orphan",
    )


    def __repr__(self) -> str:
        return f"<User {self.username} ({self.email})>"

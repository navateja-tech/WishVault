"""
Shared Pydantic schemas used across multiple domains.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """Standard message response."""
    message: str


class PaginatedResponse(BaseModel):
    """Base for paginated responses."""
    total: int
    page: int
    page_size: int
    total_pages: int

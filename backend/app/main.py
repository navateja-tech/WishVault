"""
UniVault Backend — FastAPI Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine
from app.common.base_model import Base

# Ensure all models are registered on Base for table creation
import app.auth.models  # noqa
import app.collections.models  # noqa
import app.products.models  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for table initialization and shutdown."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


def create_app() -> FastAPI:
    """Application factory pattern."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="Save products from anywhere. Organize everything in one place.",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # SlowAPI Rate Limiting setup
    from slowapi import Limiter, _rate_limit_exceeded_handler
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded

    limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_PER_MINUTE}/minute"])
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Include Routers
    from app.auth.router import router as auth_router
    from app.collections.router import router as collections_router
    from app.products.router import router as products_router
    app.include_router(auth_router, prefix="/api/v1")
    app.include_router(collections_router, prefix="/api/v1")
    app.include_router(products_router, prefix="/api/v1")

    # Health check
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {"status": "healthy", "app": settings.APP_NAME, "version": "0.1.0"}

    return app


app = create_app()

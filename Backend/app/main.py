from fastapi import FastAPI

from app.database.connection import engine
from app.database.models import Base
from app.middleware.auth_middleware import AuthMiddleware
from app.routers import adjustments, auth, deliveries, products, receipts, transfers, warehouses


app = FastAPI(title="StockVerse API", version="1.0.0")
app.add_middleware(AuthMiddleware)


@app.on_event("startup")
async def startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", tags=["Health"])
async def root() -> dict[str, str]:
    return {
        "message": "StockVerse API is running",
        "docs": "/docs",
        "health": "/health",
    }


app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(warehouses.router, prefix="/warehouses", tags=["Warehouses"])
app.include_router(receipts.router, prefix="/receipts", tags=["Receipts"])
app.include_router(deliveries.router, prefix="/deliveries", tags=["Deliveries"])
app.include_router(transfers.router, prefix="/transfers", tags=["Transfers"])
app.include_router(adjustments.router, prefix="/adjustments", tags=["Adjustments"])

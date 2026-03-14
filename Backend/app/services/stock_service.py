from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Stock


async def get_or_create_stock(db: AsyncSession, product_id: int, warehouse_id: int) -> Stock:
    stock = await db.scalar(
        select(Stock).where(Stock.product_id == product_id, Stock.warehouse_id == warehouse_id)
    )
    if stock:
        return stock

    stock = Stock(product_id=product_id, warehouse_id=warehouse_id, quantity=0)
    db.add(stock)
    await db.flush()
    return stock


async def increase_stock(db: AsyncSession, product_id: int, warehouse_id: int, quantity: float) -> Stock:
    stock = await get_or_create_stock(db, product_id, warehouse_id)
    stock.quantity += quantity
    await db.flush()
    return stock


async def decrease_stock(db: AsyncSession, product_id: int, warehouse_id: int, quantity: float) -> Stock:
    stock = await get_or_create_stock(db, product_id, warehouse_id)
    if stock.quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock for this operation",
        )
    stock.quantity -= quantity
    await db.flush()
    return stock


async def set_stock(db: AsyncSession, product_id: int, warehouse_id: int, counted_quantity: float) -> Stock:
    stock = await get_or_create_stock(db, product_id, warehouse_id)
    stock.quantity = counted_quantity
    await db.flush()
    return stock

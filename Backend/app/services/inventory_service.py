from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Product, StockMovement, Warehouse
from app.services.stock_service import decrease_stock, increase_stock, set_stock


async def _ensure_product_exists(db: AsyncSession, product_id: int) -> None:
    product = await db.scalar(select(Product).where(Product.id == product_id))
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")


async def _warehouse_name(db: AsyncSession, warehouse_id: int) -> str:
    warehouse = await db.scalar(select(Warehouse).where(Warehouse.id == warehouse_id))
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse.name


async def _log_movement(
    db: AsyncSession,
    *,
    product_id: int,
    operation_type: str,
    quantity: float,
    source_location: str | None,
    destination_location: str | None,
    user_id: int,
) -> StockMovement:
    movement = StockMovement(
        product_id=product_id,
        operation_type=operation_type,
        quantity=quantity,
        source_location=source_location,
        destination_location=destination_location,
        user_id=user_id,
    )
    db.add(movement)
    await db.flush()
    return movement


async def process_receipt(
    db: AsyncSession, *, product_id: int, warehouse_id: int, quantity: float, user_id: int
) -> StockMovement:
    await _ensure_product_exists(db, product_id)
    destination = await _warehouse_name(db, warehouse_id)

    await increase_stock(db, product_id, warehouse_id, quantity)
    movement = await _log_movement(
        db,
        product_id=product_id,
        operation_type="receipt",
        quantity=quantity,
        source_location="supplier",
        destination_location=destination,
        user_id=user_id,
    )
    await db.commit()
    await db.refresh(movement)
    return movement


async def process_delivery(
    db: AsyncSession, *, product_id: int, warehouse_id: int, quantity: float, user_id: int
) -> StockMovement:
    await _ensure_product_exists(db, product_id)
    source = await _warehouse_name(db, warehouse_id)

    await decrease_stock(db, product_id, warehouse_id, quantity)
    movement = await _log_movement(
        db,
        product_id=product_id,
        operation_type="delivery",
        quantity=quantity,
        source_location=source,
        destination_location="customer",
        user_id=user_id,
    )
    await db.commit()
    await db.refresh(movement)
    return movement


async def process_transfer(
    db: AsyncSession,
    *,
    product_id: int,
    source_warehouse_id: int,
    destination_warehouse_id: int,
    quantity: float,
    user_id: int,
) -> StockMovement:
    if source_warehouse_id == destination_warehouse_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source and destination warehouses must be different",
        )

    await _ensure_product_exists(db, product_id)
    source = await _warehouse_name(db, source_warehouse_id)
    destination = await _warehouse_name(db, destination_warehouse_id)

    await decrease_stock(db, product_id, source_warehouse_id, quantity)
    await increase_stock(db, product_id, destination_warehouse_id, quantity)
    movement = await _log_movement(
        db,
        product_id=product_id,
        operation_type="transfer",
        quantity=quantity,
        source_location=source,
        destination_location=destination,
        user_id=user_id,
    )
    await db.commit()
    await db.refresh(movement)
    return movement


async def process_adjustment(
    db: AsyncSession,
    *,
    product_id: int,
    warehouse_id: int,
    counted_quantity: float,
    user_id: int,
) -> StockMovement:
    await _ensure_product_exists(db, product_id)
    warehouse = await _warehouse_name(db, warehouse_id)

    await set_stock(db, product_id, warehouse_id, counted_quantity)
    movement = await _log_movement(
        db,
        product_id=product_id,
        operation_type="adjustment",
        quantity=counted_quantity,
        source_location=warehouse,
        destination_location=warehouse,
        user_id=user_id,
    )
    await db.commit()
    await db.refresh(movement)
    return movement

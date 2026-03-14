from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.database.models import User, Warehouse
from app.schemas.warehouse_schema import WarehouseCreate, WarehouseRead, WarehouseUpdate
from app.utils.auth_utils import get_current_user


router = APIRouter()


@router.get("", response_model=list[WarehouseRead])
async def list_warehouses(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Warehouse]:
    rows = await db.scalars(select(Warehouse).order_by(Warehouse.id.asc()))
    return list(rows)


@router.post("", response_model=WarehouseRead, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    payload: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Warehouse:
    warehouse = Warehouse(**payload.model_dump())
    db.add(warehouse)
    await db.commit()
    await db.refresh(warehouse)
    return warehouse


@router.get("/{warehouse_id}", response_model=WarehouseRead)
async def get_warehouse(
    warehouse_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Warehouse:
    warehouse = await db.scalar(select(Warehouse).where(Warehouse.id == warehouse_id))
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse


@router.put("/{warehouse_id}", response_model=WarehouseRead)
async def update_warehouse(
    warehouse_id: int,
    payload: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Warehouse:
    warehouse = await db.scalar(select(Warehouse).where(Warehouse.id == warehouse_id))
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(warehouse, field, value)

    await db.commit()
    await db.refresh(warehouse)
    return warehouse


@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_warehouse(
    warehouse_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    warehouse = await db.scalar(select(Warehouse).where(Warehouse.id == warehouse_id))
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")

    await db.delete(warehouse)
    await db.commit()

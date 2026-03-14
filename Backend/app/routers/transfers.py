from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.database.models import StockMovement, User
from app.schemas.operation_schema import MovementRead, TransferCreate
from app.services.inventory_service import process_transfer
from app.utils.auth_utils import get_current_user


router = APIRouter()


@router.post("", response_model=MovementRead, status_code=status.HTTP_201_CREATED)
async def create_transfer(
    payload: TransferCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StockMovement:
    return await process_transfer(
        db,
        product_id=payload.product_id,
        source_warehouse_id=payload.source_warehouse_id,
        destination_warehouse_id=payload.destination_warehouse_id,
        quantity=payload.quantity,
        user_id=current_user.id,
    )


@router.get("", response_model=list[MovementRead])
async def list_transfers(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[StockMovement]:
    rows = await db.scalars(
        select(StockMovement)
        .where(StockMovement.operation_type == "transfer")
        .order_by(StockMovement.timestamp.desc())
        .limit(200)
    )
    return list(rows)

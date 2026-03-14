from datetime import datetime

from pydantic import BaseModel, Field


class ReceiptCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: float = Field(gt=0)


class DeliveryCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: float = Field(gt=0)


class TransferCreate(BaseModel):
    product_id: int
    source_warehouse_id: int
    destination_warehouse_id: int
    quantity: float = Field(gt=0)


class AdjustmentCreate(BaseModel):
    product_id: int
    warehouse_id: int
    counted_quantity: float = Field(ge=0)


class MovementRead(BaseModel):
    id: int
    product_id: int
    operation_type: str
    quantity: float
    source_location: str | None
    destination_location: str | None
    timestamp: datetime
    user_id: int

    class Config:
        from_attributes = True

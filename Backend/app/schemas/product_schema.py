from datetime import datetime

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    sku: str = Field(min_length=2, max_length=80)
    category: str | None = Field(default=None, max_length=120)
    unit: str = Field(min_length=1, max_length=30)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    sku: str | None = Field(default=None, min_length=2, max_length=80)
    category: str | None = Field(default=None, max_length=120)
    unit: str | None = Field(default=None, min_length=1, max_length=30)


class ProductRead(BaseModel):
    id: int
    name: str
    sku: str
    category: str | None
    unit: str
    created_at: datetime

    class Config:
        from_attributes = True

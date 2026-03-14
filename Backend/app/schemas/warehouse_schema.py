from pydantic import BaseModel, Field


class WarehouseCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class WarehouseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class WarehouseRead(BaseModel):
    id: int
    name: str
    location: str | None

    class Config:
        from_attributes = True

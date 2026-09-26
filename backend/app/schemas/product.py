from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    price: Decimal = Field(..., gt=0)
    stock_quantity: Decimal = Field(default=Decimal("0.00"), ge=0)
    low_stock_threshold: Decimal = Field(default=Decimal("5.00"), ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    price: Optional[Decimal] = Field(default=None, gt=0)
    stock_quantity: Optional[Decimal] = Field(default=None, ge=0)
    low_stock_threshold: Optional[Decimal] = Field(default=None, ge=0)


class ProductResponse(BaseModel):
    id: int
    user_id: int
    name: str
    price: Decimal
    stock_quantity: Decimal
    low_stock_threshold: Decimal

    class Config:
        from_attributes = True
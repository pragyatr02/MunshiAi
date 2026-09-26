from decimal import Decimal
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TransactionItemCreate(BaseModel):
    product_id: Optional[int] = None
    quantity: Decimal = Field(default=Decimal("1.00"), gt=0)
    unit_price: Decimal = Field(..., gt=0)


class TransactionCreate(BaseModel):
    customer_id: Optional[int] = None

    transaction_type: str = Field(
        ...,
        pattern="^(SALE|PAYMENT|EXPENSE|PURCHASE)$"
    )

    money_direction: str = Field(
        ...,
        pattern="^(IN|OUT)$"
    )

    amount: Decimal = Field(..., gt=0)

    payment_status: str = Field(
        default="COMPLETED",
        pattern="^(CREDIT|PAID|PENDING|COMPLETED)$"
    )

    description: Optional[str] = None

    transaction_date: Optional[datetime] = None

    items: list[TransactionItemCreate] = []


class TransactionItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    quantity: Decimal
    unit_price: Decimal

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    customer_id: Optional[int]

    transaction_type: str
    money_direction: str
    amount: Decimal
    payment_status: str
    description: Optional[str]

    transaction_date: datetime
    verification_status: str
    source: str
    created_at: datetime

    items: list[TransactionItemResponse] = []

    class Config:
        from_attributes = True
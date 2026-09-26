from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ExtractedItem(BaseModel):
    name: str
    quantity: Optional[Decimal] = None


class TransactionExtraction(BaseModel):
    customer_name: Optional[str] = None
    amount: Optional[Decimal] = None

    transaction_type: Optional[str] = None
    money_direction: Optional[str] = None
    payment_status: Optional[str] = None

    items: list[ExtractedItem] = []

    references: list[str] = []
    missing_fields: list[str] = []
    possible_interpretations: list[str] = []
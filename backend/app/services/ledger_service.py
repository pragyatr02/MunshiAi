from decimal import Decimal
from typing import Any, Iterable

from app.models.transaction import Transaction


CREDIT_SALE_STATUSES = {"CREDIT", "PENDING", "UNPAID"}
PAYMENT_RECEIVED_TYPES = {"PAYMENT", "PAYMENT_RECEIVED"}
PAYMENT_MADE_TYPES = {"PAYMENT_MADE"}


def transaction_outstanding_delta(transaction: Transaction) -> Decimal:
    """
    Change in what the customer owes the merchant.

    Credit sale increases outstanding.
    Payment received decreases outstanding.
    Money paid out to the customer increases outstanding (advance/loan).
    Paid/cash sales do not change outstanding.
    """
    amount = Decimal(str(transaction.amount or 0))
    tx_type = (transaction.transaction_type or "").upper()
    status = (transaction.payment_status or "").upper()
    direction = (transaction.money_direction or "").upper()

    if tx_type == "SALE" and status in CREDIT_SALE_STATUSES:
        return amount

    if tx_type in PAYMENT_RECEIVED_TYPES and direction == "IN":
        return -amount

    if tx_type == "PAYMENT" and direction == "OUT":
        return amount

    if tx_type in PAYMENT_MADE_TYPES and direction == "OUT":
        return amount

    return Decimal("0.00")


def compute_outstanding(transactions: Iterable[Transaction]) -> Decimal:
    outstanding = Decimal("0.00")
    for transaction in transactions:
        if getattr(transaction, "verification_status", "VERIFIED") != "VERIFIED":
            continue
        outstanding += transaction_outstanding_delta(transaction)
    return outstanding

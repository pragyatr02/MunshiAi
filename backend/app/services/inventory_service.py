from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.transaction import Transaction
from app.models.transaction_item import TransactionItem


def update_stock_for_transaction(
    db: Session,
    transaction: Transaction,
):
    if transaction.transaction_type not in {"SALE", "PURCHASE"}:
        return

    for item in transaction.transaction_items:
        if item.product_id is None:
            continue

        product = (
            db.query(Product)
            .filter(
                Product.id == item.product_id,
                Product.user_id == transaction.user_id,
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found",
            )

        quantity = item.quantity

        if transaction.transaction_type == "SALE":
            if product.stock_quantity < quantity:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Insufficient stock for product '{product.name}'. "
                        f"Available: {product.stock_quantity}, "
                        f"requested: {quantity}"
                    ),
                )

            product.stock_quantity -= quantity

        elif transaction.transaction_type == "PURCHASE":
            product.stock_quantity += quantity
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.transaction import Transaction
from app.models.product import Product


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total sales
    total_sales = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.transaction_type == "SALE",
            Transaction.money_direction == "IN",
            Transaction.verification_status == "VERIFIED",
        )
        .scalar()
    )

    # Total money received
    total_received = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.money_direction == "IN",
            Transaction.verification_status == "VERIFIED",
        )
        .scalar()
    )

    # Total money paid out
    total_paid = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.money_direction == "OUT",
            Transaction.verification_status == "VERIFIED",
        )
        .scalar()
    )

    # Product count
    product_count = (
        db.query(func.count(Product.id))
        .filter(
            Product.user_id == current_user.id,
        )
        .scalar()
    )

    # Low-stock products
    low_stock_products = (
        db.query(Product)
        .filter(
            Product.user_id == current_user.id,
            Product.stock_quantity <= Product.low_stock_threshold,
        )
        .order_by(Product.stock_quantity.asc())
        .all()
    )

    # Recent transactions
    recent_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == current_user.id,
            Transaction.verification_status == "VERIFIED",
        )
        .order_by(Transaction.transaction_date.desc())
        .limit(5)
        .all()
    )

    return {
        "summary": {
            "total_sales": total_sales,
            "total_received": total_received,
            "total_paid": total_paid,
            "product_count": product_count,
        },

        "low_stock": [
            {
                "id": product.id,
                "name": product.name,
                "stock_quantity": product.stock_quantity,
                "low_stock_threshold": product.low_stock_threshold,
            }
            for product in low_stock_products
        ],

        "recent_transactions": [
            {
                "id": transaction.id,
                "customer_id": transaction.customer_id,
                "transaction_type": transaction.transaction_type,
                "money_direction": transaction.money_direction,
                "amount": transaction.amount,
                "payment_status": transaction.payment_status,
                "transaction_date": transaction.transaction_date,
            }
            for transaction in recent_transactions
        ],
    }
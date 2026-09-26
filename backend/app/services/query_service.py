from typing import Any

from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.transaction import Transaction


def execute_query(
    db: Session,
    user_id: int,
    intent: str,
    customer_name: str | None = None,
) -> dict[str, Any]:

    if intent == "TOTAL_SALES":
        total = (
            db.query(Transaction.amount)
            .filter(
                Transaction.user_id == user_id,
                Transaction.transaction_type == "SALE",
                Transaction.money_direction == "IN",
            )
            .all()
        )

        total_amount = sum(
            (row[0] for row in total),
            0,
        )

        return {
            "intent": intent,
            "answer": f"Total sales are ₹{total_amount}.",
            "data": {
                "total_sales": total_amount,
            },
        }

    if intent == "CUSTOMER_BALANCE":
        if not customer_name:
            return {
                "intent": intent,
                "answer": "Please specify the customer name.",
                "data": {},
            }

        customer = (
            db.query(Customer)
            .filter(
                Customer.user_id == user_id,
                Customer.name.ilike(customer_name),
            )
            .first()
        )

        if not customer:
            return {
                "intent": intent,
                "answer": f"Customer '{customer_name}' was not found.",
                "data": {},
            }

        transactions = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.customer_id == customer.id,
                Transaction.verification_status == "VERIFIED",
            )
            .all()
        )

        balance = 0

        for transaction in transactions:
            if transaction.money_direction == "IN":
                balance += transaction.amount
            elif transaction.money_direction == "OUT":
                balance -= transaction.amount

        return {
            "intent": intent,
            "answer": f"{customer.name}'s balance is ₹{balance}.",
            "data": {
                "customer_id": customer.id,
                "customer_name": customer.name,
                "balance": balance,
            },
        }

    if intent == "RECENT_TRANSACTIONS":
        transactions = (
            db.query(Transaction)
            .filter(
                Transaction.user_id == user_id,
                Transaction.verification_status == "VERIFIED",
            )
            .order_by(Transaction.transaction_date.desc())
            .limit(10)
            .all()
        )

        return {
            "intent": intent,
            "answer": f"Found {len(transactions)} recent transactions.",
            "data": {
                "transactions": [
                    {
                        "id": transaction.id,
                        "amount": transaction.amount,
                        "transaction_type": transaction.transaction_type,
                        "money_direction": transaction.money_direction,
                        "payment_status": transaction.payment_status,
                        "transaction_date": transaction.transaction_date,
                    }
                    for transaction in transactions
                ]
            },
        }

    return {
        "intent": intent,
        "answer": "I could not understand that query.",
        "data": {},
    }
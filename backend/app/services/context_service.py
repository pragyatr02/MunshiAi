from typing import Any

from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.transaction import Transaction
from app.models.transaction_draft import TransactionDraft


def get_previous_customer_context(
    db: Session,
    user_id: int,
) -> dict[str, Any]:
    """Use the merchant's latest verified ledger entry as conversation context."""
    last_transaction = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.verification_status == "VERIFIED",
        )
        .order_by(Transaction.transaction_date.desc())
        .first()
    )

    if last_transaction and last_transaction.customer_id:
        customer = (
            db.query(Customer)
            .filter(Customer.id == last_transaction.customer_id)
            .first()
        )
        if customer:
            return {
                "customer_name": customer.name,
                "customer_id": customer.id,
            }

    last_draft = (
        db.query(TransactionDraft)
        .filter(
            TransactionDraft.user_id == user_id,
            TransactionDraft.verification_status.in_(
                ["READY", "PENDING_CONFIRMATION", "COMMITTED"]
            ),
        )
        .order_by(TransactionDraft.created_at.desc())
        .first()
    )

    if last_draft and isinstance(last_draft.candidate_data, dict):
        name = last_draft.candidate_data.get("customer_name")
        if name:
            return {"customer_name": name}

    return {}


def resolve_context(
    extracted_data: dict[str, Any],
    previous_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Resolve references using recent conversation/transaction context.
    """
    if previous_context is None:
        previous_context = {}

    customer_name = extracted_data.get("customer_name")
    references = extracted_data.get("references", [])

    if customer_name:
        return {
            "resolved_customer": customer_name,
            "context_used": False,
            "context_reason": "Customer explicitly identified in current statement.",
        }

    previous_customer = previous_context.get("customer_name")

    if references:
        if previous_customer:
            return {
                "resolved_customer": previous_customer,
                "context_used": True,
                "context_reason": (
                    f"Reference resolved using previous context: "
                    f"{previous_customer}"
                ),
            }

        return {
            "resolved_customer": None,
            "context_used": True,
            "context_reason": "Reference exists but no previous customer context is available.",
        }

    return {
        "resolved_customer": None,
        "context_used": False,
        "context_reason": "No customer or reference found.",
    }

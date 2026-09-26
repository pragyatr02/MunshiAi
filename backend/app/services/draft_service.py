from typing import Any

from sqlalchemy.orm import Session

from app.models.transaction_draft import TransactionDraft
from app.models.user import User


def create_transaction_draft(
    db: Session,
    current_user: User,
    extracted_data: dict[str, Any],
    verification: dict[str, Any],
) -> TransactionDraft:

    verification_status, ambiguity_status, clarification_question = _status_from_verification(
        verification
    )

    draft = TransactionDraft(
        user_id=current_user.id,
        candidate_data=extracted_data,
        confidence_score=verification["confidence_score"],
        ambiguity_status=ambiguity_status,
        verification_status=verification_status,
        clarification_question=clarification_question,
    )

    db.add(draft)
    db.commit()
    db.refresh(draft)

    return draft


def update_transaction_draft(
    db: Session,
    draft: TransactionDraft,
    updated_data: dict[str, Any],
    verification: dict[str, Any],
) -> TransactionDraft:

    verification_status, ambiguity_status, clarification_question = _status_from_verification(
        verification
    )

    draft.candidate_data = updated_data
    draft.confidence_score = verification["confidence_score"]
    draft.ambiguity_status = ambiguity_status
    draft.verification_status = verification_status
    draft.clarification_question = clarification_question

    db.commit()
    db.refresh(draft)

    return draft


def serialize_draft(
    draft: TransactionDraft,
    extracted_data: dict[str, Any] | None = None,
    verification: dict[str, Any] | None = None,
) -> dict[str, Any]:
    data = extracted_data if extracted_data is not None else (draft.candidate_data or {})
    verification = verification or {}
    items = []
    for item in data.get("items") or []:
        name = item.get("name") or item.get("product_name")
        items.append(
            {
                "name": name,
                "product_name": name,
                "quantity": item.get("quantity"),
            }
        )

    is_ambiguous = (
        draft.verification_status == "NEEDS_CLARIFICATION"
        or draft.ambiguity_status == "AMBIGUOUS"
        or bool(verification.get("is_ambiguous"))
    )

    raw_score = float(draft.confidence_score or 0)
    confidence = raw_score / 100.0 if raw_score > 1 else raw_score

    status = "clarification_needed" if is_ambiguous else draft.verification_status

    return {
        "id": draft.id,
        "draft_id": draft.id,
        "status": status,
        "verification_status": draft.verification_status,
        "ambiguity_status": draft.ambiguity_status,
        "customer_name": data.get("customer_name"),
        "amount": data.get("amount"),
        "transaction_type": data.get("transaction_type"),
        "money_direction": data.get("money_direction"),
        "payment_status": data.get("payment_status"),
        "items": items,
        "confidence": confidence,
        "ambiguity": is_ambiguous,
        "clarification_question": draft.clarification_question if is_ambiguous else None,
        "missing_fields": data.get("missing_fields") or [],
        "transcription": data.get("original_text"),
    }


def _status_from_verification(verification: dict[str, Any]) -> tuple[str, str, str | None]:
    decision = verification["decision"]

    if decision == "AUTO_VERIFY":
        return "READY", "CLEAR", None

    if decision == "CONFIRM":
        return "PENDING_CONFIRMATION", "UNCERTAIN", None

    question = (
        verification.get("clarification_question")
        or verification.get("ambiguity_reason")
        or "Please provide more details about this transaction."
    )
    return "NEEDS_CLARIFICATION", "AMBIGUOUS", question

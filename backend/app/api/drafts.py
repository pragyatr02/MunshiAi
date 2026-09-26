from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user

from app.models.user import User
from app.models.transaction_draft import TransactionDraft
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.models.transaction_item import TransactionItem
from app.models.product import Product

from app.schemas.draft import (
    TransactionDraftResponse,
    DraftClarificationRequest,
)

from app.services.llm_service import extract_transaction
from app.services.context_service import resolve_context
from app.services.verification_service import evaluate_transaction
from app.services.draft_service import update_transaction_draft
from app.services.inventory_service import update_stock_for_transaction


router = APIRouter(
    prefix="/drafts",
    tags=["Transaction Drafts"],
)


@router.get("/{draft_id}", response_model=TransactionDraftResponse)
def get_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = (
        db.query(TransactionDraft)
        .filter(
            TransactionDraft.id == draft_id,
            TransactionDraft.user_id == current_user.id,
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Transaction draft not found",
        )

    return draft


@router.post("/{draft_id}/confirm")
def confirm_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = (
        db.query(TransactionDraft)
        .filter(
            TransactionDraft.id == draft_id,
            TransactionDraft.user_id == current_user.id,
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Transaction draft not found",
        )

    if draft.verification_status != "READY":
        raise HTTPException(
            status_code=400,
            detail="This draft is not ready for confirmation",
        )

    data = draft.candidate_data

    customer = None

    if data.get("customer_name"):
        customer = (
            db.query(Customer)
            .filter(
                Customer.user_id == current_user.id,
                Customer.name.ilike(data["customer_name"]),
            )
            .first()
        )

    if data.get("customer_name") and not customer:
        raise HTTPException(
            status_code=404,
            detail=f"Customer '{data['customer_name']}' not found",
        )

    if not data.get("amount"):
        raise HTTPException(
            status_code=400,
            detail="Transaction amount is missing",
        )

    if not data.get("transaction_type"):
        raise HTTPException(
            status_code=400,
            detail="Transaction type is missing",
        )

    if not data.get("money_direction"):
        raise HTTPException(
            status_code=400,
            detail="Money direction is missing",
        )

    transaction = Transaction(
        user_id=current_user.id,
        customer_id=customer.id if customer else None,
        transaction_type=data["transaction_type"],
        money_direction=data["money_direction"],
        amount=data["amount"],
        payment_status=data.get("payment_status") or "COMPLETED",
        description="Created from verified AI transaction draft",
        verification_status="VERIFIED",
        source="AI",
    )

    db.add(transaction)
    db.flush()

    for item in data.get("items", []):
        product_name = item.get("name")
        quantity = item.get("quantity")

        if not product_name or quantity is None:
            continue

        product = (
            db.query(Product)
            .filter(
                Product.user_id == current_user.id,
                Product.name.ilike(product_name),
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product '{product_name}' not found",
            )

        transaction_item = TransactionItem(
            transaction_id=transaction.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.price,
        )

        db.add(transaction_item)

    db.flush()

    db.refresh(transaction)

    update_stock_for_transaction(
        db=db,
        transaction=transaction,
    )

    draft.verification_status = "COMMITTED"

    db.commit()
    db.refresh(transaction)

    return {
        "message": "Transaction committed successfully",
        "transaction_id": transaction.id,
        "draft_id": draft.id,
        "verification_status": draft.verification_status,
    }


@router.post("/{draft_id}/clarify")
def clarify_draft(
    draft_id: int,
    clarification_data: DraftClarificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    draft = (
        db.query(TransactionDraft)
        .filter(
            TransactionDraft.id == draft_id,
            TransactionDraft.user_id == current_user.id,
        )
        .first()
    )

    if not draft:
        raise HTTPException(
            status_code=404,
            detail="Transaction draft not found",
        )

    if draft.verification_status != "NEEDS_CLARIFICATION":
        raise HTTPException(
            status_code=400,
            detail="This draft does not require clarification",
        )

    original_data = draft.candidate_data

    clarification_text = clarification_data.clarification

    combined_text = (
        f"Original transaction: {original_data}. "
        f"User clarification: {clarification_text}"
    )

    extracted_data = extract_transaction(combined_text)

    context_result = resolve_context(
        extracted_data,
        previous_context=original_data,
    )

    verification = evaluate_transaction(
        extracted_data,
        original_text=combined_text,
        context_result=context_result,
    )

    updated_draft = update_transaction_draft(
        db=db,
        draft=draft,
        updated_data=extracted_data,
        verification=verification,
    )

    return {
        "message": "Draft clarification processed successfully",
        "draft_id": updated_draft.id,
        "extracted_data": extracted_data,
        "context": context_result,
        "verification": verification,
        "draft": {
            "verification_status": updated_draft.verification_status,
            "ambiguity_status": updated_draft.ambiguity_status,
            "clarification_question": updated_draft.clarification_question,
        },
    }
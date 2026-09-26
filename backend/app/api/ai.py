from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from app.services.llm_service import extract_transaction
from app.services.context_service import resolve_context
from app.services.verification_service import evaluate_transaction
from app.services.draft_service import create_transaction_draft

router = APIRouter(
    prefix="/ai",
    tags=["AI Processing"],
)


@router.post("/process")
def process_transaction(
    text: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. LLM extracts structured transaction data
    extracted_data = extract_transaction(text)

    # 2. Resolve references using available context
    context_result = resolve_context(
        extracted_data,
        previous_context=None,
    )

    # 3. Evaluate confidence and ambiguity
    verification = evaluate_transaction(
        extracted_data,
        original_text=text,
        context_result=context_result,
    )

    # 4. Create a temporary transaction draft
    draft = create_transaction_draft(
        db=db,
        current_user=current_user,
        extracted_data=extracted_data,
        verification=verification,
    )

    return {
        "draft_id": draft.id,
        "extracted_data": extracted_data,
        "context": context_result,
        "verification": verification,
        "draft": {
            "verification_status": draft.verification_status,
            "ambiguity_status": draft.ambiguity_status,
            "clarification_question": draft.clarification_question,
        },
    }
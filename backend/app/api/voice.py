from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.llm_service import extract_transaction
from app.services.context_service import resolve_context
from app.services.verification_service import evaluate_transaction
from app.services.draft_service import create_transaction_draft


router = APIRouter(
    prefix="/voice",
    tags=["Voice Processing"],
)


@router.post("/transcribe")
async def transcribe_voice(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Process voice/text input through the MunshiAI transaction pipeline.

    Input can be:
    1. Audio file in multipart field: file
    2. Browser speech-recognition transcript in multipart field: text

    The current local version uses the provided text directly because
    external STT/LLM credits are unavailable.
    """

    transcript_text = None

    # ---------------------------------------------------------
    # CASE 1: Browser speech recognition / typed text
    # ---------------------------------------------------------

    if text and text.strip():
        transcript_text = text.strip()

    # ---------------------------------------------------------
    # CASE 2: Audio upload
    # ---------------------------------------------------------

    elif file is not None:
        if not file.content_type:
            raise HTTPException(
                status_code=400,
                detail="File type could not be determined",
            )

        allowed_types = {
            "audio/mpeg",
            "audio/wav",
            "audio/x-wav",
            "audio/mp4",
            "audio/x-m4a",
            "audio/webm",
            "audio/ogg",
        }

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported audio type: {file.content_type}",
            )

        audio_data = await file.read()

        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="Audio file is empty",
            )

        # External STT is currently unavailable.
        #
        # IMPORTANT:
        # We cannot derive real speech text from raw audio locally
        # without an STT model/service.
        #
        # Browser SpeechRecognition should therefore provide `text`
        # during current testing.
        raise HTTPException(
            status_code=400,
            detail=(
                "Audio received, but local STT is unavailable. "
                "Use browser speech recognition so the transcript "
                "is sent as text."
            ),
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="No voice transcript or audio file was provided",
        )

    # ---------------------------------------------------------
    # STEP 1: Transaction extraction
    # ---------------------------------------------------------

    extracted_data = extract_transaction(
        transcript_text
    )

    # ---------------------------------------------------------
    # STEP 2: Context resolution
    # ---------------------------------------------------------

    context_result = resolve_context(
        extracted_data,
        previous_context=None,
    )

    # ---------------------------------------------------------
    # STEP 3: Verification
    # ---------------------------------------------------------

    verification = evaluate_transaction(
        extracted_data,
        original_text=transcript_text,
        context_result=context_result,
    )

    # ---------------------------------------------------------
    # STEP 4: Create draft
    # ---------------------------------------------------------

    draft = create_transaction_draft(
        db=db,
        current_user=current_user,
        extracted_data=extracted_data,
        verification=verification,
    )

    return {
        "message": "Voice transaction processed successfully",

        "transcript": transcript_text,

        "extracted_data": extracted_data,

        "context": context_result,

        "verification": verification,

        "draft": {
            "id": draft.id,
            "draft_id": draft.id,
            "customer_name": extracted_data.get("customer_name"),
            "amount": extracted_data.get("amount"),
            "transaction_type": extracted_data.get("transaction_type"),
            "money_direction": extracted_data.get("money_direction"),
            "payment_status": extracted_data.get("payment_status"),
            "items": extracted_data.get("items", []),

            "verification_status": draft.verification_status,
            "ambiguity_status": draft.ambiguity_status,
            "clarification_question": draft.clarification_question,
        },

        "draft_id": draft.id,

        "user_id": current_user.id,
    }
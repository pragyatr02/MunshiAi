from decimal import Decimal
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class TransactionDraftResponse(BaseModel):
    id: int
    user_id: int
    voice_note_id: Optional[int]
    candidate_data: dict[str, Any]
    confidence_score: Decimal
    ambiguity_status: str
    verification_status: str
    clarification_question: Optional[str]
    created_at: datetime
    updated_at: datetime

class Config:
        from_attributes = True
class DraftClarificationRequest(BaseModel):
    clarification: str = Field(..., min_length=1, max_length=500)
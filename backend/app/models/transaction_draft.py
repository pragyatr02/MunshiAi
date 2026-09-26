from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Numeric, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.database import Base


class TransactionDraft(Base):
    __tablename__ = "transaction_drafts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    voice_note_id = Column(
        Integer,
        ForeignKey("voice_notes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    candidate_data = Column(JSONB, nullable=False)

    confidence_score = Column(Numeric(5, 2), nullable=False)

    ambiguity_status = Column(String(50), nullable=False)

    verification_status = Column(String(50), nullable=False, default="RECEIVED")

    clarification_question = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="transaction_drafts")
    voice_note = relationship("VoiceNote", back_populates="transaction_drafts")
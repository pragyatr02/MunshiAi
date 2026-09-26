from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class VoiceNote(Base):
    """
    Voice note audio record and transcript captured from vendor microphone.
    """
    __tablename__ = "voice_notes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    # Nullable because a voice note is recorded before any transaction is verified/committed
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, index=True)

    audio_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    language = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="voice_notes")
    transaction = relationship("Transaction", back_populates="voice_notes")
    
    transaction_drafts = relationship(
    "TransactionDraft",
    back_populates="voice_note",
)

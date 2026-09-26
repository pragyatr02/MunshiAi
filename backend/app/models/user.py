from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    """
    User model representing shop owners/vendors using MunshiAI.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # Note: Authoritative financial transactions and customers are NOT cascade-deleted on user deletion.
    customers = relationship("Customer", back_populates="user")
    products = relationship("Product", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    voice_notes = relationship("VoiceNote", back_populates="user")
    # Drafts are uncommitted AI candidates and can be cascade-deleted
    transaction_drafts = relationship("TransactionDraft", back_populates="user", cascade="all, delete-orphan")

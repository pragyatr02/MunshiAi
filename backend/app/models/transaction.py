from sqlalchemy import Column, Integer, String, Numeric, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Transaction(Base):
    """
    Authoritative financial ledger model.
    Only validated, verified transactions enter this table.
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    # RESTRICT prevents deleting a User if transactions exist, preserving financial history
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    # SET NULL preserves transaction record even if customer is deleted
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)

    transaction_type = Column(String(50), nullable=False)  # SALE, PAYMENT, EXPENSE, PURCHASE
    money_direction = Column(String(10), nullable=False)    # IN, OUT (Explicit flow)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_status = Column(String(50), nullable=False, default="COMPLETED")  # CREDIT, PAID, PENDING
    description = Column(Text, nullable=True)

    transaction_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    verification_status = Column(String(50), nullable=False, default="VERIFIED")
    source = Column(String(50), nullable=False, default="MANUAL")  # VOICE, MANUAL
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="transactions")
    customer = relationship("Customer", back_populates="transactions")
    # Transaction items belong to this specific transaction and cascade delete with it
    transaction_items = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")
    voice_notes = relationship("VoiceNote", back_populates="transaction")

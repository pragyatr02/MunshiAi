from decimal import Decimal
from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class TransactionItem(Base):
    """
    Line items within an authoritative transaction (e.g. 2 bags of rice @ 50/bag).
    """
    __tablename__ = "transaction_items"

    id = Column(Integer, primary_key=True, index=True)
    # Line items cascade with their transaction
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    # Product is nullable with SET NULL to preserve sale lines if a product catalog item is deleted
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)

    quantity = Column(Numeric(10, 2), nullable=False, default=Decimal("1.00"))
    unit_price = Column(Numeric(10, 2), nullable=False)

    # Relationships
    transaction = relationship("Transaction", back_populates="transaction_items")
    product = relationship("Product", back_populates="transaction_items")

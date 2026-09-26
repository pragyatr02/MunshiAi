from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Product(Base):
    """
    Product model representing vendor items/inventory in kirana stores.
    """
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    # Uses Numeric to support fractional stock (e.g. 2.5 kg rice, 1.5 L oil)
    stock_quantity = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    low_stock_threshold = Column(Numeric(10, 2), nullable=False, default=Decimal("5.00"))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="products")
    # Deleting a product must NOT delete historical transaction items
    transaction_items = relationship("TransactionItem", back_populates="product")

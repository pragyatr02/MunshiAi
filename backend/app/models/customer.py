from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Customer(Base):
    """
    Customer model representing vendors' clients/buyers (e.g. Ramesh).
    """

    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=False, index=True)
    address = Column(String(255), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="customers")

    # Historical transactions must NOT be deleted if a customer is removed
    transactions = relationship("Transaction", back_populates="customer")
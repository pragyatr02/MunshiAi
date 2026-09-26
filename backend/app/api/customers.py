from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.customer import Customer
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
)
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
)


@router.post("/", response_model=CustomerResponse)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_customer = Customer(
        user_id=current_user.id,
        name=customer.name,
        phone=customer.phone,
        address=customer.address,
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


@router.get("/", response_model=list[CustomerResponse])
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customers = (
        db.query(Customer)
        .filter(Customer.user_id == current_user.id)
        .order_by(Customer.id.desc())
        .all()
    )

    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.user_id == current_user.id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer


@router.patch("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.user_id == current_user.id,
        )
        .first()
    )

    if not existing_customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    update_data = customer.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing_customer, field, value)

    db.commit()
    db.refresh(existing_customer)

    return existing_customer


@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.user_id == current_user.id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully"
    }


@router.get("/{customer_id}/balance")
def get_customer_balance(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.user_id == current_user.id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.customer_id == customer_id,
            Transaction.user_id == current_user.id,
        )
        .all()
    )

    total_credit = Decimal("0.00")
    total_payment = Decimal("0.00")

    for transaction in transactions:

        if transaction.transaction_type == "SALE":
            if transaction.payment_status == "CREDIT":
                total_credit += transaction.amount

        elif transaction.transaction_type == "PAYMENT":
            total_payment += transaction.amount

    outstanding_balance = total_credit - total_payment

    return {
        "customer_id": customer.id,
        "customer_name": customer.name,
        "total_credit": total_credit,
        "total_payment": total_payment,
        "outstanding_balance": outstanding_balance,
    }


@router.get("/{customer_id}/transactions")
def get_customer_transactions(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    customer = (
        db.query(Customer)
        .filter(
            Customer.id == customer_id,
            Customer.user_id == current_user.id,
        )
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.customer_id == customer_id,
            Transaction.user_id == current_user.id,
        )
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    return transactions
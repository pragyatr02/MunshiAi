from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.customer import Customer
from app.models.product import Product
from app.models.transaction import Transaction
from app.models.transaction_item import TransactionItem
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate customer belongs to logged-in user
    if transaction_data.customer_id is not None:
        customer = (
            db.query(Customer)
            .filter(
                Customer.id == transaction_data.customer_id,
                Customer.user_id == current_user.id,
            )
            .first()
        )

        if not customer:
            raise HTTPException(
                status_code=404,
                detail="Customer not found",
            )

    # Validate products belong to logged-in user
    for item in transaction_data.items:
        if item.product_id is not None:
            product = (
                db.query(Product)
                .filter(
                    Product.id == item.product_id,
                    Product.user_id == current_user.id,
                )
                .first()
            )

            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {item.product_id} not found",
                )

    new_transaction = Transaction(
        user_id=current_user.id,
        customer_id=transaction_data.customer_id,
        transaction_type=transaction_data.transaction_type,
        money_direction=transaction_data.money_direction,
        amount=transaction_data.amount,
        payment_status=transaction_data.payment_status,
        description=transaction_data.description,
        verification_status="VERIFIED",
        source="MANUAL",
    )

    if transaction_data.transaction_date:
        new_transaction.transaction_date = transaction_data.transaction_date

    db.add(new_transaction)
    db.flush()

    # Add transaction items
    for item in transaction_data.items:
        transaction_item = TransactionItem(
            transaction_id=new_transaction.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )

        db.add(transaction_item)

    db.commit()

    created_transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.transaction_items))
        .filter(
            Transaction.id == new_transaction.id,
            Transaction.user_id == current_user.id,
        )
        .first()
    )

    return created_transaction


@router.get("/", response_model=list[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = (
        db.query(Transaction)
        .options(joinedload(Transaction.transaction_items))
        .filter(
            Transaction.user_id == current_user.id
        )
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transaction = (
        db.query(Transaction)
        .options(joinedload(Transaction.transaction_items))
        .filter(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
        .first()
    )

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    return transaction
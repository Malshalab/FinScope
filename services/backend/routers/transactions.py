from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from sqlalchemy import func, desc
from ..deps import get_db
from ..schemas.transactions import (
    transactionResponse,
    addTransaction,
    transactionDistributionResponse,
)
from ..db.models import Transactions, User
from ..security import get_current_user

router = APIRouter()


@router.post("/addTransaction", response_model=transactionResponse)
def add_transaction_api(
    payload: addTransaction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new transaction for the authenticated user."""
    transaction = Transactions(
        account=payload.account,
        type=payload.type,
        user_id=current_user.id,
        description=payload.description,
        category=payload.category,
        amount=payload.amount,
        status=payload.status,
        date=payload.date,
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/", response_model=list[transactionResponse])
def get_transactions(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Return all transactions for the authenticated user ordered by recency."""
    return (
        db.query(Transactions)
        .filter(Transactions.user_id == current_user.id)
        .order_by(Transactions.date.desc())
        .all()
    )


# Get transactions categorized
@router.get("/category", response_model=list[transactionDistributionResponse])
def get_transaction_categorized(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """Aggregate transactions by category with totals and percentage share."""
    rows = (
        db.query(
            Transactions.category.label("category"),
            func.sum(func.abs(Transactions.amount)).label("total_amount"),
            func.count(Transactions.id).label("txn_count"),
        )
        .filter(
            Transactions.user_id == current_user.id,
            Transactions.status != "pending",
        )
        .group_by(Transactions.category)
        .order_by(desc("total_amount"))
        .all()
    )

    total_amount = sum((row.total_amount or Decimal("0")) for row in rows) or Decimal("0")

    distribution: list[transactionDistributionResponse] = []
    for row in rows:
        amount = Decimal(row.total_amount or 0)
        percent = float((amount / total_amount * 100) if total_amount else 0)
        distribution.append(
            transactionDistributionResponse(
                category=row.category,
                amount=amount,
                count=int(row.txn_count or 0),
                percent=percent,
            )
        )

    return distribution

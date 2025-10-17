from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class transactionResponse(BaseModel):
    id: int
    account: str
    description: str
    category: str
    amount: Decimal
    status: str
    type: str
    date: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class addTransaction(BaseModel):
    account: str
    type: str
    description: str
    category: str
    amount: Decimal
    status: str
    date: datetime

class transactionDistributionResponse(BaseModel):
    category: str
    amount: Decimal
    count: int
    percent: float
    model_config = ConfigDict(from_attributes=True)

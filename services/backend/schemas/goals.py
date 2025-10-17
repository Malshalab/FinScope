from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict
from pydantic import BaseModel, Field, condecimal, constr, validator
from typing import Annotated, Literal, Optional
from pydantic import BaseModel, Field, StringConstraints

GoalStatusLiteral = Literal["active", "paused", "achieved", "cancelled"]
NameStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
AmountDec = Annotated[Decimal, Field(gt=0, max_digits=18, decimal_places=2)]

class addGoalBody(BaseModel):
    name: NameStr
    description: Optional[str] = None
    target_amount: AmountDec
    target_date: datetime
    priority: int = Field(3, ge=1, le=5)
    status: GoalStatusLiteral = "active"

class GoalOut(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    target_amount: Decimal
    target_date: datetime
    priority: int
    status: GoalStatusLiteral
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime]

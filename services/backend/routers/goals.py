from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..deps import get_db
from ..schemas.goals import GoalOut, addGoalBody
from ..db.models import Goal, User
from ..security import get_current_user

router = APIRouter()

@router.post("/addGoal", response_model=GoalOut)
def addGoal(
    payload: addGoalBody, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = Goal(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        target_amount=payload.target_amount,
        target_date=payload.target_date,
        priority=payload.priority,
        status=payload.status,
    )

    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.get("/", response_model=list[GoalOut])
def getAllGoals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .all()
    )

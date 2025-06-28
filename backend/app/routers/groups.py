from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.schemas import SplitType 

router = APIRouter()

@router.post("/groups")
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    db_group = models.Group(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    for user_id in group.user_ids:
        db.add(models.GroupUser(group_id=db_group.id, user_id=user_id))
    db.commit()
    return {"group_id": db_group.id}

@router.post("/groups/{group_id}/expenses")
def add_expense(group_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
     # Verify group exists
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Get group user IDs
    group_user_ids = {gu.user_id for gu in db.query(models.GroupUser).filter(models.GroupUser.group_id == group_id).all()}

    # Verify paid_by is in group
    if expense.paid_by not in group_user_ids:
        raise HTTPException(status_code=400, detail="Payer must be part of the group")

    # Verify all split user_ids are in group
    split_user_ids = {s.user_id for s in expense.splits}
    if not split_user_ids.issubset(group_user_ids):
        raise HTTPException(status_code=400, detail="All split users must be part of the group")
    
    print(f"Received split_type: {expense.split_type}")
    print(f"Split type: {type(expense.split_type)}")

    # Validate splits
    if expense.split_type == SplitType.PERCENTAGE:
        total_pct = sum((s.percentage or 0) for s in expense.splits)
        if abs(total_pct - 100) > 0.01:
            raise HTTPException(status_code=400, detail=f"Percentage splits must sum to 100. Got {total_pct}")
        if any(s.percentage is None for s in expense.splits):
            raise HTTPException(status_code=400, detail="Each split must have a percentage for percentage split")

    elif expense.split_type == SplitType.EQUAL:
        if any(s.percentage is not None for s in expense.splits):
            raise HTTPException(status_code=400, detail="Splits must not include percentage for equal split")
    else:
        raise HTTPException(status_code=400, detail=f"Invalid split_type: {expense.split_type}")



    # Create expense record
    db_expense = models.Expense(
        group_id=group_id,
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        split_type=expense.split_type
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    # Calculate split amounts
    if expense.split_type == schemas.SplitType.EQUAL:
        if len(expense.splits) == 0:
            raise HTTPException(status_code=400, detail="Splits required for EQUAL split")

        if any(s.user_id is None for s in expense.splits):
            raise HTTPException(status_code=400, detail="All splits must include user_id")

        if any(s.percentage is not None for s in expense.splits):
            raise HTTPException(status_code=400, detail="Splits must not include percentage for equal split")

    per_person = round(expense.amount / len(expense.splits), 2)
    splits_data = [
        models.ExpenseSplit(expense_id=db_expense.id, user_id=s.user_id, amount=per_person)
        for s in expense.splits
    ]

    if expense.split_type == SplitType.PERCENTAGE:
        splits_data = [
            models.ExpenseSplit(
                expense_id=db_expense.id,
                user_id=s.user_id,
                amount=round((s.percentage / 100.0) * expense.amount, 2) # type: ignore
            )
            for s in expense.splits
        ]

    db.add_all(splits_data)
    db.commit()

    return {"message": "Expense added", "expense_id": db_expense.id}

@router.get("/groups")
def get_all_groups(db: Session = Depends(get_db)):
    groups = db.query(models.Group).all()
    result = []
    for group in groups:
        # Get group users
        user_ids = [gu.user_id for gu in group.users]
        # Get total expenses for this group
        total_expenses = db.query(models.Expense).filter(models.Expense.group_id == group.id).with_entities(
            models.Expense.amount
        ).all()
        total_amount = sum(exp.amount for exp in total_expenses)
        result.append({
            "id": group.id,
            "name": group.name,
            "users": user_ids,
            "total_expenses": total_amount
        })
    return result

@router.get("/groups/{group_id}")
def get_group_details(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Get group users
    user_ids = [gu.user_id for gu in group.users]
    
    # Get total expenses for this group
    total_expenses = db.query(models.Expense).filter(models.Expense.group_id == group_id).with_entities(
        models.Expense.amount
    ).all()
    total_amount = sum(exp.amount for exp in total_expenses)

    return {
        "id": group.id,
        "name": group.name,
        "users": user_ids,
        "total_expenses": total_amount
    }

@router.get("/groups/{group_id}/balances")
def group_balances(group_id: int, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).filter(models.Expense.group_id == group_id).all()
    balances = {}
    for exp in expenses:
        balances.setdefault(exp.paid_by, 0)
        balances[exp.paid_by] += exp.amount
        splits = db.query(models.ExpenseSplit).filter(models.ExpenseSplit.expense_id == exp.id).all()
        for s in splits:
            balances.setdefault(s.user_id, 0)
            balances[s.user_id] -= s.amount
    return {"balances": balances}

@router.get("/users/{user_id}/balances")
def user_balances(user_id: int, db: Session = Depends(get_db)):
    groups = db.query(models.Group).join(models.GroupUser).filter(models.GroupUser.user_id == user_id).all()
    summary = {}
    for g in groups:
        group_bal = group_balances(g.id, db)["balances"] # type: ignore
        summary[g.name] = group_bal.get(user_id, 0)
    return {"user_id": user_id, "balances": summary}

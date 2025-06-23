# ------------------ SCHEMAS ------------------ #
from typing import List, Optional
from pydantic import BaseModel
from enum import Enum

class SplitType(str, Enum):
    EQUAL = "EQUAL"
    PERCENTAGE = "PERCENTAGE"

class GroupCreate(BaseModel):
    name: str
    user_ids: List[int]

class ExpenseSplitInput(BaseModel):
    user_id: int
    amount: Optional[float] = None
    percentage: Optional[float] = None

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: SplitType
    splits: List[ExpenseSplitInput]

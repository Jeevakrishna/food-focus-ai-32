from pydantic import BaseModel
from typing import Optional

class FoodResponse(BaseModel):
    food_name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    match_confidence: float
    error: Optional[str] = None
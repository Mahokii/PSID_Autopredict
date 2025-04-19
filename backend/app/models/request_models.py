from pydantic import BaseModel
from typing import Optional

class VehicleInput(BaseModel):
    make: str
    model: str
    year: int
    fuel_type: str
    hp: float
    transmission: str
    cylinders: Optional[float] = None
    drive: Optional[str] = None
    size: Optional[str] = None
    style: Optional[str] = None

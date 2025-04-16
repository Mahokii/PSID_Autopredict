from pydantic import BaseModel

class VehicleInput(BaseModel):
    make: str
    model: str
    year: int
    fuel_type: str
    hp: float
    cylinders: float
    transmission: str
    drive: str
    doors: float
    size: str
    style: str
    highway_mpg: float
    city_mpg: float

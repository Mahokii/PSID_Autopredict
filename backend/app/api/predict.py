from fastapi import APIRouter, HTTPException
from app.models.request_models import VehicleInput
from app.core.logic import predict_price_logic

router = APIRouter()

@router.post("/predict_price")
def predict_price(input_data: VehicleInput):
    try:
        prediction = predict_price_logic(input_data)
        return {"predicted_price": round(prediction, 2)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
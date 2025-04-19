from fastapi import APIRouter
from app.models.request_models import VehicleInput
from app.core.logic import predict_price_logic

router = APIRouter()

@router.post("/api/predict_price")
def predict_price_endpoint(vehicle: VehicleInput):
    input_data = vehicle.dict()  # ✅ Correction ici : conversion Pydantic → dict

    try:
        prediction_result = predict_price_logic(input_data)
        print("✅ Résultat de la prédiction :", prediction_result)  # DEBUG

        # Retour uniquement la prédiction
        return prediction_result

    except Exception as e:
        print(f"❌ Erreur lors de la prédiction : {str(e)}")  # DEBUG
        return {
            "success": False,
            "message": f"Erreur lors de la prédiction : {str(e)}",
            "result": None
        }

from pathlib import Path
import joblib

model = joblib.load(Path("models/random_forest_model.joblib"))
encoders = joblib.load(Path("models/encoders.joblib"))
normalizers = joblib.load(Path("models/normalizers.joblib"))
cv_rmse_percent = joblib.load(Path("models/cv_rmse_percent.joblib"))  # 👈 nouveau

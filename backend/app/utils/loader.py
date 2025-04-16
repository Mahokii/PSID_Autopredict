import joblib
from pathlib import Path

model = joblib.load(Path("backend/models/random_forest_model.joblib"))
encoders = joblib.load(Path("backend/models/encoders.joblib"))
normalizers = joblib.load(Path("backend/models/normalizers.joblib"))

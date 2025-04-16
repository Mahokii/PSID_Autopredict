import pandas as pd
from app.utils.loader import model, encoders, normalizers

def predict_price_logic(input_data):
    df = pd.DataFrame([input_data.dict()])

    categorical = ['make', 'model', 'fuel_type', 'transmission', 'drive', 'size', 'style']
    numerical = ['year', 'hp', 'cylinders', 'doors', 'highway_mpg', 'city_mpg']

    # Harmonisation
    for col in categorical:
        df[col] = df[col].astype(str).str.strip().str.upper()

    # Encodage
    for col in categorical:
        df[col + "_encoded"] = df[col].map(encoders[col]).fillna(-1)

    # Normalisation
    for col in numerical:
        min_val, max_val = normalizers[col]
        df[col] = (df[col] - min_val) / (max_val - min_val)

    input_features = [
        'make_encoded', 'model_encoded', 'year', 'fuel_type_encoded', 'hp',
        'cylinders', 'transmission_encoded', 'drive_encoded', 'doors',
        'size_encoded', 'style_encoded', 'highway_mpg', 'city_mpg'
    ]

    X = df[input_features]
    return model.predict(X)[0]

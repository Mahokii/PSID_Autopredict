from fastapi import HTTPException
from app.utils.loader import model, encoders, normalizers, cv_rmse_percent
from app.utils.db import get_cars_collection
import pandas as pd
import numpy as np
import difflib
import unicodedata

# 🔤 Fonction de normalisation texte (casse, accents, etc.)
def normalize_text(text):
    if not isinstance(text, str):
        return str(text)
    text = text.lower()
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    text = ' '.join(sorted(text.split()))
    return text

# 🔍 Recherche approximative avec seuil de similarité
def approximate_match(value, known_values, threshold=0.6):
    norm_value = normalize_text(value)
    norm_known = [normalize_text(k) for k in known_values]
    match = difflib.get_close_matches(norm_value, norm_known, n=1, cutoff=threshold)
    if match:
        index = norm_known.index(match[0])
        return known_values[index]
    return None

# 🔎 Inférence automatique des champs manquants via MongoDB
def infer_missing_features(input_data: dict) -> dict:
    collection = get_cars_collection()
    cars_data = pd.DataFrame(list(collection.find()))

    if cars_data.empty:
        return {
            "cylinders": 4,
            "drive": "unknown",
            "size": "unknown",
            "style": "unknown"
        }

    # Filtrage par matching approché
    cars_data = cars_data[cars_data["year"] == input_data["year"]]
    cars_data = cars_data[cars_data["hp"] == input_data["hp"]]

    matched_make = approximate_match(input_data["make"], cars_data["make"].unique())
    if matched_make:
        cars_data = cars_data[cars_data["make"] == matched_make]

    matched_fuel = approximate_match(input_data["fuel_type"], cars_data["fuel_type"].unique())
    if matched_fuel:
        cars_data = cars_data[cars_data["fuel_type"] == matched_fuel]

    matched_trans = approximate_match(input_data["transmission"], cars_data["transmission"].unique())
    if matched_trans:
        cars_data = cars_data[cars_data["transmission"] == matched_trans]

    if cars_data.empty:
        return {
            "cylinders": 4,
            "drive": "unknown",
            "size": "unknown",
            "style": "unknown"
        }

    return {
        "cylinders": int(round(cars_data["cylinders"].mean())) if "cylinders" in cars_data else 4,
        "drive": cars_data["drive"].mode()[0] if "drive" in cars_data and not cars_data["drive"].empty else "unknown",
        "size": cars_data["size"].mode()[0] if "size" in cars_data and not cars_data["size"].empty else "unknown",
        "style": cars_data["style"].mode()[0] if "style" in cars_data and not cars_data["style"].empty else "unknown"
    }

# 🧼 Prétraitement des données (encodage + normalisation)
def preprocess_input_data(input_df: pd.DataFrame) -> pd.DataFrame:
    for col, encoder in encoders.items():
        if col in input_df.columns:
            print(f"🔡 Encodage de '{col}' avec classes :", encoder.classes_)
            input_df[col] = input_df[col].apply(
                lambda x: encoder.transform([x])[0]
                if x in encoder.classes_
                else (
                    encoder.transform([approximate_match(x, encoder.classes_)])[0]
                    if approximate_match(x, encoder.classes_) else -1
                )
            )
            print(f"✅ Valeurs encodées pour '{col}' :", input_df[col].values)

    for col, (min_val, max_val) in normalizers.items():
        if col in input_df.columns:
            print(f"📏 Normalisation de '{col}' entre {min_val} et {max_val}")
            input_df[col] = (input_df[col] - min_val) / (max_val - min_val)
            print(f"✅ Valeurs normalisées pour '{col}' :", input_df[col].values)

    return input_df

# 🔮 Pipeline complet : préparation + prédiction + logs
def predict_price_logic(user_input: dict) -> dict:
    required_fields = ["make", "year", "hp", "fuel_type", "transmission"]

    # Vérifie les champs manquants
    missing_fields = [field for field in required_fields if field not in user_input]
    if missing_fields:
        raise HTTPException(status_code=400, detail=f"Champ(s) requis manquant(s) : {', '.join(missing_fields)}")

    print("🔍 Données d'entrée reçues :", user_input)

    # Inférence MongoDB des champs secondaires
    inferred = infer_missing_features(user_input)
    print("🧠 Champs inférés automatiquement :", inferred)

    # Ajout des valeurs inférées dans l'input
    user_input.update(inferred)
    print("📦 Données finales complètes avant prédiction :", user_input)

    # DataFrame brut avant transformation
    input_df = pd.DataFrame([user_input])
    print("📄 DataFrame brut avant transformation :\n", input_df)

    # Encodage + normalisation
    input_df = preprocess_input_data(input_df)

    # Aligne les colonnes avec celles attendues par le modèle
    expected_features = model.feature_names_in_
    for col in expected_features:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[expected_features]

    print("📐 DataFrame final aligné pour le modèle :\n", input_df)

    # Prédiction
    prediction = model.predict(input_df)[0]
    user_input["predicted_price"] = round(float(prediction), 2)
    user_input["cv_rmse_percent"] = round(float(cv_rmse_percent), 2)  # 👈 ajouté ici
    print("💸 Prédiction terminée :", user_input["predicted_price"])

    return user_input

import pandas as pd
import joblib
from pymongo import MongoClient
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score, cross_val_predict
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import numpy as np

from features import CATEGORICAL_COLS, NUMERICAL_COLS, FEATURES_TO_KEEP

# --- Connexion MongoDB ---
client = MongoClient("mongodb://admin:admin@mongodb:27017/")
db = client["voitureDB"]
collection = db["voitures"]

print("📥 Données chargées depuis MongoDB...")
df = pd.DataFrame(list(collection.find()))

# Suppression de l'_id Mongo
df.drop(columns=["_id"], inplace=True)

# Suppression des outliers sur la colonne price (quantile à 0.85)
price_threshold = df["price"].quantile(0.85)
df = df[df["price"] <= price_threshold]
print(f"✅ Seuil appliqué (quantile 0.85) : {price_threshold:.2f}")
print(f"✅ Lignes restantes après filtrage : {len(df)}")

# Réduction du dataframe aux colonnes conservées
df = df[FEATURES_TO_KEEP + ["price"]]
print(f"🧾 Colonnes utilisées : {df.columns.tolist()}")

# Encodage LabelEncoder
encoders = {}
for col in CATEGORICAL_COLS:
    encoder = LabelEncoder()
    df[col] = encoder.fit_transform(df[col])
    encoders[col] = encoder
    print(f"🔤 {col} : {len(encoder.classes_)} classes")

# Normalisation des variables numériques entre 0 et 1
normalizers = {}
for col in NUMERICAL_COLS:
    min_val, max_val = df[col].min(), df[col].max()
    df[col] = (df[col] - min_val) / (max_val - min_val)
    normalizers[col] = (min_val, max_val)
    print(f"📏 Normalisation {col} : min={min_val}, max={max_val}")

# Séparation X / y
X = df.drop(columns=["price"])
y = df["price"]

# Split et entraînement
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Évaluation
y_pred_train = model.predict(X_train)
y_pred_test = model.predict(X_test)

train_r2 = r2_score(y_train, y_pred_train)
train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
test_r2 = r2_score(y_test, y_pred_test)
test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))

print("\n--- 🎯 Résultats entraînement ---")
print(f"Train R²: {train_r2:.4f}")
print(f"Train RMSE: {train_rmse:.2f}")
print(f"Train RMSE %: {(train_rmse / y_train.mean()) * 100:.2f}%")

print("\n--- 🚀 Résultats test ---")
print(f"Test R²: {test_r2:.4f}")
print(f"Test RMSE: {test_rmse:.2f}")
print(f"Test RMSE %: {(test_rmse / y_test.mean()) * 100:.2f}%")

# --- 🔄 Cross-validation ---
cv_scores = cross_val_score(model, X, y, cv=5, scoring="r2")
print("\n--- 🔄 Cross-validation ---")
print(f"Scores R² : {np.round(cv_scores, 4)}")
print(f"Moyenne R² : {np.mean(cv_scores):.4f}, écart-type : {np.std(cv_scores):.4f}")

# ✅ Calcul du RMSE moyen en cross-validation
cv_preds = cross_val_predict(model, X, y, cv=5)
cv_rmse = np.sqrt(mean_squared_error(y, cv_preds))
cv_rmse_percent = (cv_rmse / y.mean()) * 100
print(f"Cross-val RMSE : {cv_rmse:.2f}")
print(f"Cross-val RMSE % : {cv_rmse_percent:.2f}%")

# Prédiction exemple utilisateur
example_input = {
    'make': 'bmw',
    'model': '5 series',
    'year': 2017,
    'fuel_type': 'essence',
    'hp': 300,
    'cylinders': 6,
    'transmission': 'automatic',
    'drive': 'rear wheel drive',
    'size': 'midsize',
    'style': 'sedan'
}
example_df = pd.DataFrame([example_input])

# Encodage de l'exemple utilisateur
for col in CATEGORICAL_COLS:
    if col in example_df.columns:
        example_df[col] = example_df[col].apply(
            lambda x: encoders[col].transform([x])[0]
            if x in encoders[col].classes_
            else -1
        )
for col in NUMERICAL_COLS:
    if col in example_df.columns:
        min_val, max_val = normalizers[col]
        example_df[col] = (example_df[col] - min_val) / (max_val - min_val)

# Réaligner les colonnes
for col in X_train.columns:
    if col not in example_df.columns:
        example_df[col] = 0
example_df = example_df[X_train.columns]

example_price = model.predict(example_df)[0]
print(f"\n💡 Prédiction pour l'exemple utilisateur : {example_price:.2f} €")

# Sauvegarde
Path("models").mkdir(parents=True, exist_ok=True)
joblib.dump(model, Path("models/random_forest_model.joblib"))
joblib.dump(encoders, Path("models/encoders.joblib"))
joblib.dump(normalizers, Path("models/normalizers.joblib"))
joblib.dump(cv_rmse_percent, Path("models/cv_rmse_percent.joblib"))  # 👈 ajouté ici

print("\n✅ Modèle et encodeurs sauvegardés dans 'backend/models/'")

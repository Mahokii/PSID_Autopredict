import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split, KFold
import joblib
import os

# ✅ Connexion MongoDB corrigée
client = MongoClient("mongodb://admin:admin@mongodb:27017/?authSource=admin")
db = client["voitureDB"]
collection = db["voitures"]
df = pd.DataFrame(list(collection.find()))

if "_id" in df.columns:
    df.drop(columns=["_id"], inplace=True)

print(f"📥 Données chargées depuis MongoDB : {df.shape[0]} lignes")

# Suppression des outliers uniquement sur le prix
print("✂️ Suppression des outliers uniquement sur la colonne 'price'...")
seuil = df["price"].quantile(0.85)
df = df[df["price"] < seuil]
print(f"✅ Seuil appliqué (80e percentile) : {seuil:.2f}")
print(f"✅ Lignes restantes après filtrage : {df.shape[0]}")

# Features
features = ['make', 'model', 'year', 'fuel_type', 'hp', 'cylinders', 'transmission',
            'drive', 'doors', 'size', 'style', 'highway_mpg', 'city_mpg']
target = 'price'

X = df[features].copy()
y = df[target].copy()

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=1)

# Encodage
categorical = ['make', 'model', 'fuel_type', 'transmission', 'drive', 'size', 'style']
numerical = ['year', 'hp', 'cylinders', 'doors', 'highway_mpg', 'city_mpg']
encoders = {}

for col in categorical:
    X_train[col] = X_train[col].astype(str).str.strip().str.upper()
    X_test[col] = X_test[col].astype(str).str.strip().str.upper()

print("\n🔤 Encodage manuel des variables catégorielles...")
for col in categorical:
    values = sorted(X_train[col].dropna().unique())
    mapping = {v: i for i, v in enumerate(values)}
    encoders[col] = mapping
    print(f" - {col} : {len(mapping)} classes")
    X_train[col] = X_train[col].map(mapping)
    X_test[col] = X_test[col].map(lambda x: mapping.get(x, -1))

# Encodage exemple
preview = X[categorical].iloc[:10].copy()
for col in categorical:
    preview[f"{col}_encoded"] = preview[col].map(encoders[col]).fillna(-1)
print("\n📊 Tableau encodé (10 premières lignes) :")
print(preview)

# Normalisation
normalizers = {}
print("\n📏 Normalisation des colonnes numériques...")
for col in numerical:
    min_val = X_train[col].min()
    max_val = X_train[col].max()
    normalizers[col] = (min_val, max_val)
    X_train[col] = (X_train[col] - min_val) / (max_val - min_val)
    X_test[col] = (X_test[col] - min_val) / (max_val - min_val)
    print(f" - {col} : min={min_val:.2f}, max={max_val:.2f}")

# Entraînement
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=1)
model.fit(X_train, y_train)

# Évaluation
train_pred = model.predict(X_train)
test_pred = model.predict(X_test)
train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
train_r2 = r2_score(y_train, train_pred)
test_r2 = r2_score(y_test, test_pred)

print("\n--- 🎯 Résultats entraînement ---")
print(f"Train R²: {train_r2:.4f}")
print(f"Train RMSE: {train_rmse:.2f}")
print(f"Train RMSE %: {(train_rmse / y_train.mean()) * 100:.2f}%")

print("\n--- 🚀 Résultats test ---")
print(f"Test R²: {test_r2:.4f}")
print(f"Test RMSE: {test_rmse:.2f}")
print(f"Test RMSE %: {(test_rmse / y_test.mean()) * 100:.2f}%")

# Cross-validation
print("\n--- 🔄 Cross-validation ---")
kf = KFold(n_splits=5, shuffle=True, random_state=1)
cv_scores = []
for train_idx, val_idx in kf.split(X_train):
    model.fit(X_train.iloc[train_idx], y_train.iloc[train_idx])
    pred = model.predict(X_train.iloc[val_idx])
    score = r2_score(y_train.iloc[val_idx], pred)
    cv_scores.append(score)
print(f"Scores R² : {np.round(cv_scores, 4)}")
print(f"Moyenne R² : {np.mean(cv_scores):.4f}, écart-type : {np.std(cv_scores):.4f}")

# Exemple utilisateur
print("\n🔍 Exemple utilisateur : prédiction")
fake_input = pd.DataFrame([{
    'make': 'BMW',
    'model': '5 Series',
    'year': 2016,
    'fuel_type': 'premium unleaded (required)',
    'hp': 248,
    'cylinders': 4,
    'transmission': 'automatic',
    'drive': 'all wheel drive',
    'doors': 4,
    'size': 'large',
    'style': 'sedan',
    'highway_mpg': 34,
    'city_mpg': 24
}])

# Harmonisation input utilisateur
for col in categorical:
    fake_input[col] = fake_input[col].astype(str).str.strip().str.upper()

# Encodage
for col in categorical:
    val = fake_input[col].values[0]
    code = encoders[col].get(val, -1)
    fake_input[col] = code
    if code == -1:
        print(f"⚠️ Label inconnu pour '{col}': {val}")

# Normalisation
for col in numerical:
    min_val, max_val = normalizers[col]
    fake_input[col] = (fake_input[col] - min_val) / (max_val - min_val)

print("\n📋 Encodage exemple utilisateur :")
print(fake_input.T)

prediction = model.predict(fake_input)[0]
print(f"\n💡 Prédiction : {prediction:,.2f} $")

# Sauvegarde
os.makedirs("backend/models", exist_ok=True)
joblib.dump(model, "backend/models/random_forest_model.joblib")
joblib.dump(encoders, "backend/models/encoders.joblib")
joblib.dump(normalizers, "backend/models/normalizers.joblib")
print("\n✅ Modèle et encodeurs sauvegardés dans 'backend/models/'")

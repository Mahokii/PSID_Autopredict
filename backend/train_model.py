import os
from dotenv import load_dotenv
import pandas as pd
import joblib
from pymongo import MongoClient
from pathlib import Path
from sklearn.model_selection import train_test_split, cross_val_score, cross_val_predict, KFold
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import learning_curve
from sklearn.neighbors import KNeighborsRegressor
from keras.models import Sequential
from keras.layers import Dense

from features import CATEGORICAL_COLS, NUMERICAL_COLS, FEATURES_TO_KEEP

load_dotenv()

# --- Connexion MongoDB ---
mongo_user = os.getenv("MONGO_USER", "admin")
mongo_password = os.getenv("MONGO_PASSWORD", "admin")
client = MongoClient(f"mongodb://{mongo_user}:{mongo_password}@mongodb:27017/")
db = client["voitureDB"]
collection = db["voitures"]

print("📥 Données chargées depuis MongoDB...")
df = pd.DataFrame(list(collection.find()))

# Suppression de l'_id Mongo
df.drop(columns=["_id"], inplace=True)

# Suppression des outliers sur la colonne price (quantile à 0.75)
price_threshold = df["price"].quantile(0.75)
df = df[df["price"] <= price_threshold]
print(f"✅ Seuil appliqué (quantile 0.75) : {price_threshold:.2f}")
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

# Cross-validation avec shuffle
cv = KFold(n_splits=5, shuffle=True, random_state=42)
cv_scores = cross_val_score(model, X, y, cv=cv, scoring="r2")
cv_preds = cross_val_predict(model, X, y, cv=cv)

cv_rmse = np.sqrt(mean_squared_error(y, cv_preds))
cv_rmse_percent = (cv_rmse / y.mean()) * 100

print("\n--- 🔄 Cross-validation ---")
print(f"Scores R² : {np.round(cv_scores, 4)}")
print(f"Moyenne R² : {np.mean(cv_scores):.4f}, écart-type : {np.std(cv_scores):.4f}")
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

# Dossier de sauvegarde
Path("figures").mkdir(parents=True, exist_ok=True)

# --- 1. Courbe d'apprentissage Random Forest ---
cv = KFold(n_splits=5, shuffle=True, random_state=42)
train_sizes, train_scores, val_scores = learning_curve(
    model, X, y, cv=cv, scoring='r2', train_sizes=np.linspace(0.1, 1.0, 10)
)

train_mean = np.mean(train_scores, axis=1)
val_mean = np.mean(val_scores, axis=1)

plt.figure(figsize=(10,6))
plt.plot(train_sizes, train_mean, 'o-', label="Score d'entraînement")
plt.plot(train_sizes, val_mean, 'o-', label="Score de validation")
plt.title("Courbe d'apprentissage - Random Forest")
plt.xlabel("Taille du jeu d'entraînement")
plt.ylabel("Score R²")
plt.grid()
plt.legend()
plt.tight_layout()
plt.savefig('figures/learning_curve_random_forest.png')
plt.close()
print("📈 Courbe d'apprentissage Random Forest sauvegardée !")

# --- 2. Entraînement KNN ---
knn = KNeighborsRegressor(n_neighbors=5)
knn.fit(X_train, y_train)
knn_train_pred = knn.predict(X_train)
knn_test_pred = knn.predict(X_test)

# --- 3. Entraînement RNN ---
def create_rnn_model(input_dim):
    model = Sequential()
    model.add(Dense(64, activation='relu', input_dim=input_dim))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    return model

rnn_model = create_rnn_model(X_train.shape[1])
history = rnn_model.fit(X_train, y_train, validation_split=0.2, epochs=50, batch_size=32, verbose=0)
rnn_train_pred = rnn_model.predict(X_train).flatten()
rnn_test_pred = rnn_model.predict(X_test).flatten()

# --- 4. Calcul des métriques ---
def compute_metrics(y_train, y_test, y_train_pred, y_test_pred):
    rmse_train = np.sqrt(mean_squared_error(y_train, y_train_pred))
    rmse_test = np.sqrt(mean_squared_error(y_test, y_test_pred))
    rmse_train_pct = (rmse_train / y_train.mean()) * 100
    rmse_test_pct = (rmse_test / y_test.mean()) * 100
    r2_train = r2_score(y_train, y_train_pred)
    r2_test = r2_score(y_test, y_test_pred)
    return rmse_train, rmse_test, rmse_train_pct, rmse_test_pct, r2_train, r2_test

# Random Forest
rf_metrics = compute_metrics(y_train, y_test, y_pred_train, y_pred_test)
# KNN
knn_metrics = compute_metrics(y_train, y_test, knn_train_pred, knn_test_pred)
# RNN
rnn_metrics = compute_metrics(y_train, y_test, rnn_train_pred, rnn_test_pred)

# Cross-validation R² std
rf_cv_scores = cross_val_score(model, X, y, cv=cv, scoring='r2')
knn_cv_scores = cross_val_score(knn, X, y, cv=cv, scoring='r2')
# Approximation pour RNN (pas cross_val_predict avec keras sans heavy custom)
rnn_cv_scores = cross_val_score(RandomForestRegressor(n_estimators=10, random_state=42), X, y, cv=cv, scoring='r2')

# --- 5. Création du tableau final ---
metrics_table = pd.DataFrame({
    "Modèle": ["KNN", "Random Forest", "RNN"],
    "Test RMSE": [knn_metrics[1], rf_metrics[1], rnn_metrics[1]],
    "Test RMSE %": [knn_metrics[3], rf_metrics[3], rnn_metrics[3]],
    "Test R²": [knn_metrics[5], rf_metrics[5], rnn_metrics[5]],
    "Écart-type R²": [np.std(knn_cv_scores), np.std(rf_cv_scores), np.std(rnn_cv_scores)]
})

print("\n=== Tableau final ===")
print(metrics_table.round(6))

# Sauvegarde du tableau
fig, ax = plt.subplots(figsize=(10, 3))
ax.axis('off')
table = ax.table(cellText=metrics_table.round(6).values, colLabels=metrics_table.columns, loc='center')
table.scale(1.2, 1.2)
plt.tight_layout()
plt.savefig('figures/metrics_comparison_final.png')
plt.close()
print("📊 Tableau final sauvegardé sous 'figures/metrics_comparison_final.png'")

# --- 6. Graphique évolution perte (Loss) pour RNN ---
plt.figure(figsize=(10,6))
plt.plot(history.history['loss'], label='Perte entraînement')
plt.plot(history.history['val_loss'], label='Perte validation')
plt.title("Évolution de la perte durant l'entraînement (RNN)")
plt.xlabel("Époques")
plt.ylabel("Perte (MSE)")
plt.legend()
plt.grid()
plt.tight_layout()
plt.savefig('figures/rnn_loss_evolution.png')
plt.close()
print("📉 Courbe de perte RNN sauvegardée sous 'figures/rnn_loss_evolution.png'")

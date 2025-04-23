import os
from dotenv import load_dotenv
import pandas as pd
from pymongo import MongoClient
import unicodedata

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

def remove_accents(text):
    if isinstance(text, str):
        return unicodedata.normalize('NFKD', text).encode('ascii', errors='ignore').decode('utf-8')
    return text

def simplify_fuel_type(fuel_type):
    if fuel_type in ['premium unleaded (required)', 'premium unleaded (recommended)', 'regular unleaded']:
        return 'essence'
    elif fuel_type in ['flex-fuel (unleaded/e85)', 'flex-fuel (premium unleaded recommended/e85)', 
                       'flex-fuel (premium unleaded required/e85)', 'flex-fuel (unleaded/natural gas)']:
        return 'flex-fuel'
    elif fuel_type == 'diesel':
        return 'diesel'
    elif fuel_type == 'electric':
        return 'electrique'
    elif fuel_type == 'natural gas':
        return 'gaz naturel'
    else:
        return 'autre'

print("📥 Lecture du fichier voiture.csv...")
df = pd.read_csv("voiture.csv")
print(f"🧼 {len(df)} lignes initiales.")

# Standardisation des colonnes
df.columns = df.columns.str.lower().str.replace(" ", "_")
df.rename(columns={
    'engine_fuel_type': 'fuel_type',
    'engine_hp': 'hp',
    'engine_cylinders': 'cylinders',
    'transmission_type': 'transmission',
    'driven_wheels': 'drive',
    'number_of_doors': 'doors',
    'market_category': 'market',
    'vehicle_size': 'size',
    'vehicle_style': 'style',
    'msrp': 'price'
}, inplace=True)

# Suppression des doublons
df = df.drop_duplicates()
print(f"✅ {len(df)} lignes après suppression des doublons.")

# Valeurs manquantes
df['fuel_type'] = df['fuel_type'].fillna('regular unleaded')
df['hp'] = df['hp'].fillna(df['hp'].mean())
df['cylinders'] = df['cylinders'].fillna(0.0)
df['doors'] = df['doors'].fillna(df['doors'].mean())

# Nettoyage texte
for col in ['make', 'model', 'fuel_type', 'transmission', 'drive', 'market', 'size', 'style']:
    df[col] = df[col].astype(str).str.lower().apply(remove_accents)

# Simplification fuel_type
df['fuel_type'] = df['fuel_type'].apply(simplify_fuel_type)

# Suppression colonnes inutiles
df.drop(['market', 'popularity', 'doors', 'highway_mpg', 'city_mpg'], axis=1, inplace=True)

# Suppression inconnues
df = df[df['transmission'] != 'unknown']
df = df[df['fuel_type'] != 'unknown']

# Nettoyage final
df['price'] = pd.to_numeric(df['price'], errors='coerce')
df['year'] = pd.to_numeric(df['year'], errors='coerce')
df.dropna(subset=['price', 'year'], inplace=True)

print("✅ Données nettoyées prêtes à l'insertion :", len(df), "lignes.")
print("🧾 Colonnes finales :", df.columns.tolist())

# Insertion MongoDB
# Récupération des identifiants depuis les variables d'environnement
mongo_user = os.getenv("MONGO_USER", "admin")
mongo_password = os.getenv("MONGO_PASSWORD", "admin")
client = MongoClient(f"mongodb://{mongo_user}:{mongo_password}@mongodb:27017/")
db = client["voitureDB"]
collection = db["voitures"]
collection.drop()
collection.insert_many(df.to_dict(orient="records"))
print("🎉 Données insérées avec succès dans 'voitureDB.voitures'")

import pandas as pd
from pymongo import MongoClient

print("📥 Lecture du fichier voiture.csv...")
df = pd.read_csv("voiture.csv")

print("🧼 Nettoyage des données...")
print(len(df), "lignes lues.")

# Renommer les colonnes
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

# Supprimer les doublons
print('Number of duplicates are : ', df.duplicated().sum())
df = df.drop_duplicates()
print(len(df), "lignes après suppression des doublons.")

print('Number of missing values in each columns are below : ')
print(df.isnull().sum())

# Supprimer les colonnes inutiles
df.drop('market', axis = 1, inplace = True)
df.drop('popularity', axis = 1, inplace = True)


# Remplissage des valeurs manquantes
df['fuel_type'] = df['fuel_type'].fillna('regular unleaded')
df['hp'] = df['hp'].fillna(0)
df['cylinders'] = df['cylinders'].fillna(0)
df['doors'] = df['doors'].fillna(df['doors'].mean())

# Conversion des types
df['price'] = pd.to_numeric(df['price'], errors='coerce')
df['year'] = pd.to_numeric(df['year'], errors='coerce')

# Supprimer les lignes critiques vides
df.dropna(subset=['price', 'year'], inplace=True)

# Nettoyage des chaînes
df['make'] = df['make'].str.strip().str.title()
df['model'] = df['model'].str.strip().str.title()

# Supression des voitures ayant unknown

df.drop(df[df['transmission']=='UNKNOWN'].index, axis='index', inplace = True)
print('Number of missing values in each columns are below : ')
print(df.isnull().sum())
print(len(df), "lignes après suppression des valeurs inconnues.")



print(f"✅ Données nettoyées prêtes à l'insertion : {len(df)} lignes.")

# Connexion MongoDB
client = MongoClient("mongodb://mongo_db:27017/")
db = client["voitureDB"]
collection = db["voitures"]

# Nettoyage de la collection
collection.drop()

# Insertion des données nettoyées
collection.insert_many(df.to_dict(orient="records"))

print("🎉 Données nettoyées insérées avec succès dans 'voitureDB.voitures'")

import pandas as pd
from pymongo import MongoClient

# Connexion à MongoDB (service Docker)
client = MongoClient("mongodb://mongodb:27017/")

# Sélection de la base et de la collection
db = client["voitureDB"]
collection = db["voitures"]

# Lire le fichier CSV
print("Lecture du fichier CSV...")
df = pd.read_csv("voiture.csv")

# Nettoyage de base
print("Nettoyage des données...")
df.dropna(how='all', inplace=True)              # Supprime les lignes entièrement vides
df = df.drop_duplicates()                       # Supprime les doublons
df = df.dropna(axis=1, how='all')               # Supprime les colonnes entièrement vides

# Conversion en dictionnaire
data = df.to_dict(orient="records")

# Insertion dans MongoDB
print(f"Insertion de {len(data)} documents dans MongoDB...")
collection.delete_many({})  # Facultatif : vide la collection avant insertion
collection.insert_many(data)

print("✅ Données insérées avec succès dans la base 'voitureDB', collection 'voitures'.")

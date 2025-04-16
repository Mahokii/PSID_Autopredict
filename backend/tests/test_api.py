import requests

# L’URL de ton API locale
url = "http://localhost:8000/api/predict_price"

# Exemple de données pour un véhicule
vehicle_data = {
    "make": "BMW",
    "model": "5 Series",
    "year": 2018,
    "fuel_type": "Premium Unleaded (Required)",
    "hp": 248,
    "cylinders": 4,
    "transmission": "Automatic",
    "drive": "Rear Wheel Drive",
    "doors": 4,
    "size": "Midsize",
    "style": "Sedan",
    "highway_mpg": 34,
    "city_mpg": 24
}

# Envoi de la requête POST
response = requests.post(url, json=vehicle_data)

# Affichage du résultat
if response.status_code == 200:
    print("✅ Prédiction réussie :")
    print(response.json())
else:
    print("❌ Erreur lors de la prédiction :")
    print(f"Code : {response.status_code}")
    print(response.text)

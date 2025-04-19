import requests

url = "http://localhost:8000/api/predict_price"

vehicle_data = {
    "make": "BMW",
    "model": "5 Series",
    "year": 2018,
    "fuel_type": "Premium Unleaded (Required)",
    "hp": 248,
    "cylinders": 4,
    "transmission": "Automatic",
    "drive": "Rear Wheel Drive",
    "size": "Midsize",
    "style": "Sedan",

}

print("🔎 Données envoyées :")
print(vehicle_data)

response = requests.post(url, json=vehicle_data)

if response.status_code == 200:
    data = response.json()
    if "predicted_price" in data:
        print(f"✅ Prédiction réussie : {data['predicted_price']} €")
    else:
        print("⚠️ Champ 'predicted_price' manquant dans la réponse :", data)
else:
    print(f"❌ Erreur {response.status_code} lors de la prédiction")
    print(response.text)

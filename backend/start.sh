#!/bin/bash

# Attente que MongoDB soit prêt
until python3 -c "import socket; s = socket.create_connection(('mongodb', 27017), timeout=2)"; do
  echo "⏳ En attente de MongoDB..."
  sleep 1
done
echo "▶ MongoDB est prêt !"

echo "▶ Importation des données MongoDB..."
python import_csv_to_mongo.py

echo "▶ Lancement de train_model ..."
python train_model.py

echo "▶ Lancement du serveur FastAPI..."
PYTHONPATH=/app uvicorn app.main:app --host 0.0.0.0 --port 8000
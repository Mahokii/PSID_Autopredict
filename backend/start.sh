#!/bin/bash

echo "▶ Importation des données MongoDB..."
python import_csv_to_mongo.py

echo "▶ Lancement du serveur FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
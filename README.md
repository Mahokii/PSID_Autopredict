# PSID Autopredict

**PSID Autopredict** est une application permettant de prédire les prix des véhicules à partir de données. Ce projet combine un backend d’API, un frontend interactif, un modèle de Machine Learning et une base de données MongoDB.

---

## 🚀 Fonctionnalités principales

- **Importation de données** : Importation d'un dataset sur MongoDB contenant des informations sur les véhicules.
- **Nettoyage des données** : Suppression des doublons et transformation des données pour l'entraînement.
- **Entraînement du modèle** : Utilisation d'un modèle `RandomForestRegressor` pour prédire les prix.
- **API REST** : Fournie via FastAPI pour interagir avec le modèle et les données.
- **Interface utilisateur** : Dashboard React pour visualiser les données et effectuer des prédictions.
- **Base de données MongoDB** : Stockage des données nettoyées et des résultats.

---

## 🛠️ Stack technique

### Backend
- **Langage** : Python 3.9+
- **Framework** : FastAPI
- **Librairies principales** :
  - `pandas`, `scikit-learn`, `joblib` (Machine Learning)
  - `pymongo` (MongoDB)
  - `uvicorn` (Serveur ASGI)

### Frontend
- **Langage** : JavaScript (ES6+)
- **Framework** : React
- **UI** : Material-UI (MUI), Bootstrap
- **Visualisation** : Plotly.js

### Conteneurisation
- **Orchestration** : Docker & Docker Compose
- **Base de données** : MongoDB avec Mongo Express pour l'administration

---

## 📁 Arborescence du projet

```
PSID_Autopredict/
├── backend/
│   ├── app/                  # API FastAPI
│   │   ├── api/
│   │   │   ├── predict.py    # Routes pour les prédictions
│   │   │   └── data.py       # Routes pour la gestion des données
│   │   ├── core/
│   │   │   ├── logic.py      # Logique métier pour les prédictions
│   │   │   └── config.py     # Configuration de l'application
│   │   ├── utils/
│   │   │   ├── loader.py     # Chargement du modèle et des encodeurs
│   │   │   └── helpers.py    # Fonctions utilitaires
│   │   └── main.py           # Point d'entrée de l'API
│   ├── import_csv_to_mongo.py
│   ├── train_model.py
│   ├── start.sh
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js     # Composant pour l'en-tête
│   │   │   ├── Footer.js     # Composant pour le pied de page
│   │   │   └── Dashboard.js  # Composant principal pour le tableau de bord
│   │   ├── pages/
│   │   │   ├── Home.js       # Page d'accueil
│   │   │   └── Predict.js    # Page pour effectuer des prédictions
│   │   ├── App.js            # Composant principal React
│   │   ├── index.js          # Point d'entrée de l'application React
│   │   └── styles.css        # Fichier de styles CSS
│   ├── package.json
│   └── README.md             # Documentation du frontend
├── models/                   # Modèle ML sauvegardé
│   └── random_forest_model.joblib
├── voiture.csv               # Données d'entrée
├── docker-compose.yml
├── Dockerfile
└── .env                      # Variables d'environnement

```

---

## ⚙️ Installation et lancement

### Prérequis
- [Docker](https://www.docker.com/) installé sur votre machine.
- [Python 3.9+](https://www.python.org/) (si vous exécutez le backend localement).

### Étapes

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Mahokii/PSID_Autopredict.git
   cd PSID_Autopredict
   ```

2. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet avec le contenu suivant :
   ```
   MONGO_USER=admin
   MONGO_PASSWORD=admin
   ```

3. **Lancer les conteneurs Docker**
   ```bash
   docker compose up --build
   ```

   Cela démarre :
   - MongoDB (port `27017`)
   - Mongo Express (port `8081`)
   - Backend FastAPI (port `8000`)
   - Frontend React (port `3000`)

4. **Accéder aux services**
   - **API FastAPI** : [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Mongo Express** : [http://localhost:8081](http://localhost:8081)
   - **Frontend** : [http://localhost:3000](http://localhost:3000)

---

## 🧪 Tests

### Backend
- Les tests unitaires pour le backend peuvent être exécutés avec `pytest` :
  ```bash
  pytest
  ```

### Frontend
- Les tests pour le frontend utilisent `jest` et `@testing-library/react` :
  ```bash
  npm test
  ```

---

## 📊 Fonctionnement du modèle

1. **Nettoyage des données** :
   - Suppression des doublons.
   - Transformation des colonnes catégoriques en variables numériques.

2. **Entraînement** :
   - Modèle : `RandomForestRegressor` de `scikit-learn`.
   - Sauvegarde du modèle dans `models/random_forest_model.joblib`.

3. **Prédiction** :
   - L'API FastAPI expose une route `/predict` pour effectuer des prédictions à partir de nouvelles données.

---

## 📝 Licence

Ce projet est sous licence Apache 2.0. Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

## 📧 Contact

Pour toute question ou suggestion, contactez-nous à **42000404@parisnanterre.fr**.

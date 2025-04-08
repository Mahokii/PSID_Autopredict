# Machine Learning Project

## Description
Ce projet est une application web basée sur un **backend FastAPI** et une **base de données PostgreSQL**, ainsi qu'un **frontend React avec Bootstrap**. L'objectif est de permettre l'interaction avec des données NoSQL stockées dans PostgreSQL et d'afficher les résultats d'analyses de Machine Learning.

---

## 📂 Structure du projet
```plaintext
machine-learning-project/
│── backend/                  # Backend FastAPI + PostgreSQL
│   ├── app/
│   │   ├── main.py           # Point d'entrée de l'API
│   │   ├── models.py         # Modèles SQLAlchemy
│   │   ├── routes.py         # Routes API
│   │   ├── services.py       # Logique métier
│   │   ├── database.py       # Connexion PostgreSQL
│   │   ├── ml/               # Scripts ML (prétraitement, entraînement...)
│   ├── requirements.txt      # Dépendances Python
│   ├── Dockerfile            # Dockerisation du backend
│
│── frontend/                 # Frontend React + Bootstrap
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages principales (Home, Dashboard...)
│   │   ├── services/         # Appels API
│   │   ├── App.js            # Composant principal
│   │   ├── index.js          # Point d'entrée React
│   ├── package.json          # Dépendances React
│   ├── Dockerfile            # Dockerisation du frontend
│
│── docker-compose.yml        # Orchestration des conteneurs
│── README.md                 # Documentation du projet
```

---

## 🚀 Installation & Exécution

### **1️⃣ Cloner le dépôt**
```bash
git clone https://github.com/ton-utilisateur/machine-learning-project.git
cd machine-learning-project
```

### **2️⃣ Lancer le backend avec PostgreSQL**
Assurez-vous que **Docker** est installé, puis exécutez :
```bash
cd backend
docker-compose up --build -d
```
Cela va démarrer **PostgreSQL** et le **serveur FastAPI**.

Testez l'API en ouvrant : [http://localhost:8000/docs](http://localhost:8000/docs)

### **3️⃣ Lancer le frontend React**
```bash
cd ../frontend
npm install  # Installer les dépendances
npm start    # Lancer le serveur React
```
Accédez à : [http://localhost:3000](http://localhost:3000)

---

## 📌 Fonctionnalités
- 🖥️ **Backend FastAPI** : API rapide et scalable
- 🗄️ **Base de données PostgreSQL (JSONB)** : Stockage NoSQL
- 🎨 **Frontend React + Bootstrap** : Interface moderne et responsive
- 📡 **API REST** : Communication entre frontend et backend
- 📊 **Dashboard interactif** : Visualisation des données

---

## 📅 Prochaines améliorations
✅ Création de composants réutilisables (Navbar, Table...)  
✅ Connexion du frontend au backend  
🔜 Intégration d'un modèle de Machine Learning  
🔜 Ajout de graphiques et statistiques avancées  

---

## 🛠 Technologies utilisées
- **Base de données** : PostgreSQL (avec JSONB pour NoSQL)
- **Backend** : FastAPI, Uvicorn, SQLAlchemy, Asyncpg
- **Frontend** : ReactJS, MUI, Bootstrap, Axios, React Router
- **Déploiement** : Docker, Docker Compose
- **Versionning** : Git
- **CI/CD** : GitHub Action
- **Hébergement en ligne** : GitHub


---

## 📢 Contribuer
1. **Forker** le projet
2. **Créer une branche** : `git checkout -b feature-ma-fonctionnalité`
3. **Commit tes changements** : `git commit -m "Ajout d'une nouvelle fonctionnalité"`
4. **Pousser la branche** : `git push origin feature-ma-fonctionnalité`
5. **Ouvrir une Pull Request** sur GitHub

---

## 📜 Licence
Ce projet est sous licence **MIT**. N'hésitez pas à le réutiliser et l'améliorer !


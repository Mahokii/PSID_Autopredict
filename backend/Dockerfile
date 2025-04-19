FROM python:3.12

WORKDIR /backend

# Étape 1 : copier les requirements et installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Étape 2 : copier le reste du code
COPY . /backend


# Étape 3 : supprimer les caractères CRLF (très important de le faire APRÈS le COPY . .)
RUN find . -name "*.sh" -exec sed -i 's/\r$//' {} \;

# Étape 4 : rendre les scripts exécutables
RUN chmod +x start.sh

# Étape 5 : lancer le script
CMD ["./start.sh"]

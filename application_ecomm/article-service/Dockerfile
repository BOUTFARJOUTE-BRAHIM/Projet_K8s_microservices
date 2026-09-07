FROM python:3.12-slim

WORKDIR /app

# Copier les dépendances et les installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY app.py .
COPY config.py .
COPY models.py .
COPY routes/ ./routes/

# Exposer le port
EXPOSE 5001

# Démarrer le serveur avec Gunicorn
CMD ["python","app.py"]

FROM python:3.12-slim

WORKDIR /app

# Copier les dépendances et les installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY manage.py .
COPY review_service/ ./review_service/
COPY reviews/ ./reviews/

# Exposer le port
EXPOSE 8002

# Démarrer le serveur avec Gunicorn
CMD ["gunicorn", "review_service.wsgi:application", "--bind", "0.0.0.0:8002", "--workers", "2", "--access-logfile", "-"]

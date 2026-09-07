FROM python:3.12-slim

WORKDIR /app

# Copier les dépendances et les installer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY manage.py .
COPY user_service/ ./user_service/
COPY users/ ./users/

# Exposer le port
EXPOSE 8001

# Démarrer le serveur avec Gunicorn
CMD ["gunicorn", "user_service.wsgi:application", "--bind", "0.0.0.0:8001", "--workers", "2", "--access-logfile", "-"]

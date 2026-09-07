"""
=============================================================
Article Service - Configuration
=============================================================

Configuration de l'application Flask et de la connexion
à la base de données PostgreSQL via SQLAlchemy.

Les paramètres sont lus depuis les variables d'environnement,
avec des valeurs par défaut pour le développement local.
"""

import os


class Config:
    """Configuration de base pour le Article Service."""

    # --- Flask ---
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-article-service')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1')

    # --- Base de données PostgreSQL ---
    DB_HOST = os.environ.get('DB_HOST')
    DB_PORT = os.environ.get('DB_PORT')
    DB_USER = os.environ.get('DB_USER')
    DB_PASSWORD = os.environ.get('DB_PASSWORD')
    DB_NAME = os.environ.get('DB_NAME')

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- Service ---
    SERVICE_NAME = 'article-service'
    SERVICE_PORT = int(os.environ.get('PORT', 5001))

"""
=============================================================
Review Service - Configuration Django (settings.py)
=============================================================

Configuration du microservice Review Service.
La base de données PostgreSQL est configurée via les mêmes
variables d'environnement que les autres microservices.
"""

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-review-service-dev-key-change-in-production'
)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True').lower() in ('true', '1', 'yes')

ALLOWED_HOSTS = ['*']

# =============================================================
# Application definition
# =============================================================

INSTALLED_APPS = [
    'django.contrib.contenttypes',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'reviews',
    'django.contrib.auth',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'review_service.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'review_service.wsgi.application'

# =============================================================
# Database - PostgreSQL (même instance que les autres services)
# =============================================================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': os.environ.get('DB_HOST', 'database01'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'NAME': os.environ.get('DB_NAME', 'ecommerce'),
    }
}

# =============================================================
# Django REST Framework
# =============================================================

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}

# =============================================================
# CORS - Autorise toutes les origines (développement)
# =============================================================

CORS_ALLOW_ALL_ORIGINS = True

# =============================================================
# Communication inter-services
# =============================================================

# URL du Product Service via le nom DNS Kubernetes
PRODUCT_SERVICE_URL = os.environ.get(
    'PRODUCT_SERVICE_URL', 'http://product-srv:3001'
)

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

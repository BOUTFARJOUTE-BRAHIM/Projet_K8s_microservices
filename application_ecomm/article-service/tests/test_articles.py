"""
=============================================================
Article Service - Tests unitaires
=============================================================

Tests pour les endpoints CRUD du microservice Article.
Utilise une base SQLite en mémoire pour l'isolation des tests.
"""

import pytest

import sys
import os

# Ajouter le dossier parent au path pour les imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from config import Config
from models import db as _db


class TestConfig(Config):
    """Configuration spécifique aux tests (SQLite en mémoire)."""
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    TESTING = True


@pytest.fixture
def app():
    """Crée une instance de l'application pour les tests."""
    app = create_app(TestConfig)
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture
def client(app):
    """Crée un client de test Flask."""
    return app.test_client()


# =============================================================
# Tests - Health Check
# =============================================================

class TestHealthCheck:
    def test_health_check(self, client):
        """Vérifie que le health check retourne UP."""
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['service'] == 'article-service'
        assert data['status'] == 'UP'


# =============================================================
# Tests - POST /api/articles (Création)
# =============================================================

class TestCreateArticle:
    def test_create_article_success(self, client):
        """Teste la création d'un article avec des données valides."""
        payload = {
            'title': 'Mon premier article',
            'content': 'Contenu de test pour l\'article.',
            'author': 'Brahim',
            'category': 'Tech'
        }
        response = client.post('/api/articles/', json=payload)
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert data['data']['title'] == 'Mon premier article'
        assert data['data']['author'] == 'Brahim'
        assert data['data']['category'] == 'Tech'
        assert data['data']['published'] is False

    def test_create_article_missing_fields(self, client):
        """Teste la création avec des champs requis manquants."""
        payload = {'title': 'Article sans contenu'}
        response = client.post('/api/articles/', json=payload)
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False

    def test_create_article_empty_title(self, client):
        """Teste la création avec un titre vide."""
        payload = {
            'title': '   ',
            'content': 'Contenu',
            'author': 'Brahim'
        }
        response = client.post('/api/articles/', json=payload)
        assert response.status_code == 400

    def test_create_article_no_json(self, client):
        """Teste la création sans body JSON."""
        response = client.post('/api/articles/',
                               data='not json',
                               content_type='text/plain')
        assert response.status_code == 400


# =============================================================
# Tests - GET /api/articles (Liste)
# =============================================================

class TestGetArticles:
    def _create_test_article(self, client, **kwargs):
        """Helper pour créer un article de test."""
        payload = {
            'title': kwargs.get('title', 'Article Test'),
            'content': kwargs.get('content', 'Contenu test'),
            'author': kwargs.get('author', 'Brahim'),
            'category': kwargs.get('category', 'Tech'),
            'published': kwargs.get('published', True)
        }
        return client.post('/api/articles/', json=payload)

    def test_get_articles_empty(self, client):
        """Teste la liste quand il n'y a aucun article."""
        response = client.get('/api/articles/')
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['count'] == 0
        assert data['data'] == []

    def test_get_articles_with_data(self, client):
        """Teste la liste avec des articles existants."""
        self._create_test_article(client, title='Article 1')
        self._create_test_article(client, title='Article 2')

        response = client.get('/api/articles/')
        assert response.status_code == 200
        data = response.get_json()
        assert data['count'] == 2

    def test_get_articles_filter_by_category(self, client):
        """Teste le filtrage par catégorie."""
        self._create_test_article(client, category='Tech')
        self._create_test_article(client, category='E-commerce')

        response = client.get('/api/articles/?category=Tech')
        data = response.get_json()
        assert data['count'] == 1
        assert data['data'][0]['category'] == 'Tech'


# =============================================================
# Tests - GET /api/articles/<id> (Détail)
# =============================================================

class TestGetArticleDetail:
    def test_get_article_success(self, client):
        """Teste la récupération d'un article existant."""
        # Créer un article
        create_resp = client.post('/api/articles/', json={
            'title': 'Article détail',
            'content': 'Contenu détail',
            'author': 'Brahim'
        })
        article_id = create_resp.get_json()['data']['id']

        # Récupérer l'article
        response = client.get(f'/api/articles/{article_id}')
        assert response.status_code == 200
        data = response.get_json()
        assert data['data']['title'] == 'Article détail'

    def test_get_article_not_found(self, client):
        """Teste la récupération d'un article inexistant."""
        response = client.get('/api/articles/9999')
        assert response.status_code == 404


# =============================================================
# Tests - PUT /api/articles/<id> (Modification)
# =============================================================

class TestUpdateArticle:
    def test_update_article_success(self, client):
        """Teste la mise à jour d'un article."""
        # Créer un article
        create_resp = client.post('/api/articles/', json={
            'title': 'Ancien titre',
            'content': 'Ancien contenu',
            'author': 'Brahim'
        })
        article_id = create_resp.get_json()['data']['id']

        # Mettre à jour
        response = client.put(f'/api/articles/{article_id}', json={
            'title': 'Nouveau titre',
            'published': True
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data['data']['title'] == 'Nouveau titre'
        assert data['data']['published'] is True
        assert data['data']['content'] == 'Ancien contenu'  # Non modifié

    def test_update_article_not_found(self, client):
        """Teste la mise à jour d'un article inexistant."""
        response = client.put('/api/articles/9999', json={'title': 'Test'})
        assert response.status_code == 404


# =============================================================
# Tests - DELETE /api/articles/<id> (Suppression)
# =============================================================

class TestDeleteArticle:
    def test_delete_article_success(self, client):
        """Teste la suppression d'un article."""
        # Créer un article
        create_resp = client.post('/api/articles/', json={
            'title': 'À supprimer',
            'content': 'Contenu',
            'author': 'Brahim'
        })
        article_id = create_resp.get_json()['data']['id']

        # Supprimer
        response = client.delete(f'/api/articles/{article_id}')
        assert response.status_code == 200

        # Vérifier la suppression
        get_resp = client.get(f'/api/articles/{article_id}')
        assert get_resp.status_code == 404

    def test_delete_article_not_found(self, client):
        """Teste la suppression d'un article inexistant."""
        response = client.delete('/api/articles/9999')
        assert response.status_code == 404

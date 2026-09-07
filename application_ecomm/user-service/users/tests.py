"""
=============================================================
User Service - Tests unitaires
=============================================================

Tests pour les endpoints REST du User Service.
Utilise le client de test Django (pas besoin de PostgreSQL).
"""

from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock


class HealthCheckTest(TestCase):
    """Tests pour le health check."""

    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_200(self):
        """Le health check doit retourner un statut 200."""
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)

    def test_health_check_contains_service_name(self):
        """Le health check doit contenir le nom du service."""
        response = self.client.get('/health/')
        data = response.json()
        self.assertEqual(data['service'], 'user-service')
        self.assertEqual(data['status'], 'UP')
        self.assertIn('timestamp', data)


class UserListViewTest(TestCase):
    """Tests pour le endpoint GET /api/users/."""

    def setUp(self):
        self.client = APIClient()

    @patch('users.views.User.objects')
    def test_list_users_returns_200(self, mock_objects):
        """La liste des utilisateurs doit retourner un statut 200."""
        mock_objects.all.return_value = mock_objects
        mock_objects.filter.return_value = []
        mock_objects.__iter__ = MagicMock(return_value=iter([]))

        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, 200)

    @patch('users.views.User.objects')
    def test_list_users_response_format(self, mock_objects):
        """La réponse doit contenir les champs success, count, data."""
        mock_objects.all.return_value = []

        response = self.client.get('/api/users/')
        data = response.json()
        self.assertIn('success', data)
        self.assertIn('count', data)
        self.assertIn('data', data)
        self.assertTrue(data['success'])


class UserCreateViewTest(TestCase):
    """Tests pour le endpoint POST /api/users/."""

    def setUp(self):
        self.client = APIClient()

    def test_create_user_missing_fields_returns_400(self):
        """Créer un utilisateur sans champs obligatoires doit retourner 400."""
        response = self.client.post('/api/users/', {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_create_user_missing_email_returns_400(self):
        """Créer un utilisateur sans email doit retourner 400."""
        response = self.client.post('/api/users/', {
            'username': 'testuser'
        }, format='json')
        self.assertEqual(response.status_code, 400)


class UserDetailViewTest(TestCase):
    """Tests pour le endpoint GET /api/users/<id>/."""

    def setUp(self):
        self.client = APIClient()

    @patch('users.views.User.objects')
    def test_get_nonexistent_user_returns_404(self, mock_objects):
        """Demander un utilisateur inexistant doit retourner 404."""
        from users.models import User
        mock_objects.get.side_effect = User.DoesNotExist

        response = self.client.get('/api/users/999/')
        self.assertEqual(response.status_code, 404)

    @patch('users.views.User.objects')
    def test_get_nonexistent_user_response_format(self, mock_objects):
        """La réponse 404 doit contenir success=false et un message."""
        from users.models import User
        mock_objects.get.side_effect = User.DoesNotExist

        response = self.client.get('/api/users/999/')
        data = response.json()
        self.assertFalse(data['success'])
        self.assertIn('message', data)

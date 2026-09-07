"""
=============================================================
Review Service - Tests unitaires
=============================================================

Tests pour les endpoints REST du Review Service.
"""

from django.test import TestCase
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
        self.assertEqual(data['service'], 'review-service')
        self.assertEqual(data['status'], 'UP')
        self.assertIn('timestamp', data)


class ReviewListViewTest(TestCase):
    """Tests pour le endpoint GET /api/reviews/."""

    def setUp(self):
        self.client = APIClient()

    @patch('reviews.views.Review.objects')
    def test_list_reviews_returns_200(self, mock_objects):
        """La liste des avis doit retourner un statut 200."""
        mock_objects.all.return_value = []

        response = self.client.get('/api/reviews/')
        self.assertEqual(response.status_code, 200)

    @patch('reviews.views.Review.objects')
    def test_list_reviews_response_format(self, mock_objects):
        """La réponse doit contenir les champs success, count, data."""
        mock_objects.all.return_value = []

        response = self.client.get('/api/reviews/')
        data = response.json()
        self.assertIn('success', data)
        self.assertIn('count', data)
        self.assertIn('data', data)
        self.assertTrue(data['success'])

    @patch('reviews.views.Review.objects')
    def test_list_reviews_filter_invalid_product_id(self, mock_objects):
        """Un product_id invalide doit retourner 400."""
        response = self.client.get('/api/reviews/?product_id=abc')
        self.assertEqual(response.status_code, 400)


class ReviewCreateViewTest(TestCase):
    """Tests pour le endpoint POST /api/reviews/."""

    def setUp(self):
        self.client = APIClient()

    def test_create_review_missing_fields_returns_400(self):
        """Créer un avis sans champs obligatoires doit retourner 400."""
        response = self.client.post('/api/reviews/', {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_create_review_invalid_rating_returns_400(self):
        """Créer un avis avec une note invalide doit retourner 400."""
        response = self.client.post('/api/reviews/', {
            'product_id': 1,
            'user_name': 'testuser',
            'rating': 6,  # Invalid: max is 5
            'comment': 'Test'
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_create_review_zero_rating_returns_400(self):
        """Créer un avis avec une note de 0 doit retourner 400."""
        response = self.client.post('/api/reviews/', {
            'product_id': 1,
            'user_name': 'testuser',
            'rating': 0,  # Invalid: min is 1
            'comment': 'Test'
        }, format='json')
        self.assertEqual(response.status_code, 400)


class ReviewDetailViewTest(TestCase):
    """Tests pour le endpoint GET /api/reviews/<id>/."""

    def setUp(self):
        self.client = APIClient()

    @patch('reviews.views.Review.objects')
    def test_get_nonexistent_review_returns_404(self, mock_objects):
        """Demander un avis inexistant doit retourner 404."""
        from reviews.models import Review
        mock_objects.get.side_effect = Review.DoesNotExist

        response = self.client.get('/api/reviews/999/')
        self.assertEqual(response.status_code, 404)

    @patch('reviews.views.Review.objects')
    def test_get_nonexistent_review_response_format(self, mock_objects):
        """La réponse 404 doit contenir success=false et un message."""
        from reviews.models import Review
        mock_objects.get.side_effect = Review.DoesNotExist

        response = self.client.get('/api/reviews/999/')
        data = response.json()
        self.assertFalse(data['success'])
        self.assertIn('message', data)


class ProductReviewStatsViewTest(TestCase):
    """Tests pour le endpoint GET /api/reviews/product/<id>/stats/."""

    def setUp(self):
        self.client = APIClient()

    @patch('reviews.views.Review.objects')
    def test_stats_no_reviews_returns_zeros(self, mock_objects):
        """Les stats d'un produit sans avis doivent retourner des zéros."""
        mock_qs = MagicMock()
        mock_qs.exists.return_value = False
        mock_objects.filter.return_value = mock_qs

        response = self.client.get('/api/reviews/product/999/stats/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['total_reviews'], 0)
        self.assertEqual(data['data']['average_rating'], 0.0)

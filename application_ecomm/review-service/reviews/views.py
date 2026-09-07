"""
=============================================================
Review Service - Vues (Views) REST
=============================================================

Vues pour la gestion des avis produits.
Le format de réponse JSON est cohérent avec les autres microservices.

Communication inter-services :
  → Product Service (http://product-service:3001)
    pour vérifier l'existence des produits avant de créer un avis.
"""

import requests
from django.conf import settings
from django.db.models import Avg, Count
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Review
from .serializers import ReviewSerializer


# URL du Product Service
PRODUCT_SERVICE_URL = getattr(
    settings, 'PRODUCT_SERVICE_URL', 'http://product-srv:3001'
)


@api_view(['GET', 'POST'])
def review_list(request):
    """
    GET  /api/reviews/  → Liste des avis (filtrable par product_id)
    POST /api/reviews/  → Soumettre un nouvel avis
    """
    if request.method == 'GET':
        return _list_reviews(request)
    elif request.method == 'POST':
        return _create_review(request)


@api_view(['GET', 'DELETE'])
def review_detail(request, pk):
    """
    GET    /api/reviews/<id>/  → Détail d'un avis
    DELETE /api/reviews/<id>/  → Supprimer un avis
    """
    try:
        review = Review.objects.get(pk=pk)
    except Review.DoesNotExist:
        return Response({
            'success': False,
            'message': f"Avis avec l'ID {pk} non trouvé"
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return _get_review(review)
    elif request.method == 'DELETE':
        return _delete_review(review)


@api_view(['GET'])
def product_review_stats(request, product_id):
    """
    GET /api/reviews/product/<product_id>/stats/
    → Statistiques des avis d'un produit (moyenne, nombre, distribution)
    """
    reviews = Review.objects.filter(product_id=product_id)

    if not reviews.exists():
        return Response({
            'success': True,
            'data': {
                'product_id': product_id,
                'average_rating': 0.0,
                'total_reviews': 0,
                'rating_distribution': {
                    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
                }
            }
        }, status=status.HTTP_200_OK)

    # Calculer la moyenne et le nombre total
    stats = reviews.aggregate(
        average_rating=Avg('rating'),
        total_reviews=Count('id')
    )

    # Distribution des notes (1 à 5)
    distribution = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0}
    rating_counts = reviews.values('rating').annotate(
        count=Count('id')
    )
    for item in rating_counts:
        distribution[str(item['rating'])] = item['count']

    return Response({
        'success': True,
        'data': {
            'product_id': product_id,
            'average_rating': round(stats['average_rating'], 1),
            'total_reviews': stats['total_reviews'],
            'rating_distribution': distribution
        }
    }, status=status.HTTP_200_OK)


# =============================================================
# Fonctions internes
# =============================================================

def _list_reviews(request):
    """Retourne la liste des avis, filtrable par product_id."""
    product_id = request.query_params.get('product_id')
    reviews = Review.objects.all()

    if product_id:
        try:
            product_id = int(product_id)
            reviews = reviews.filter(product_id=product_id)
        except ValueError:
            return Response({
                'success': False,
                'message': 'Le product_id doit être un nombre valide'
            }, status=status.HTTP_400_BAD_REQUEST)

    serializer = ReviewSerializer(reviews, many=True)
    return Response({
        'success': True,
        'count': len(serializer.data),
        'data': serializer.data
    }, status=status.HTTP_200_OK)


def _create_review(request):
    """
    Crée un nouvel avis.
    Vérifie d'abord que le produit existe via le Product Service.
    """
    serializer = ReviewSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Données invalides',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    product_id = serializer.validated_data['product_id']

    # -------------------------------------------------------
    # Vérification du produit auprès du Product Service
    # Communication inter-services via API REST
    # -------------------------------------------------------
    try:
        response = requests.get(
            f"{PRODUCT_SERVICE_URL}/api/products/{product_id}",
            timeout=5
        )
        product_data = response.json()

        if not product_data.get('success'):
            return Response({
                'success': False,
                'message': f"Produit avec l'ID {product_id} non trouvé dans le catalogue"
            }, status=status.HTTP_404_NOT_FOUND)

    except requests.exceptions.RequestException as e:
        return Response({
            'success': False,
            'message': f"Impossible de contacter le Product Service pour vérifier le produit {product_id}",
            'error': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    # Créer l'avis
    serializer.save()
    return Response({
        'success': True,
        'message': f'Avis soumis avec succès pour le produit "{product_data["data"]["name"]}"',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


def _get_review(review):
    """Retourne le détail d'un avis."""
    serializer = ReviewSerializer(review)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)


def _delete_review(review):
    """Supprime un avis."""
    review_id = review.id
    review.delete()
    return Response({
        'success': True,
        'message': f'Avis #{review_id} supprimé avec succès'
    }, status=status.HTTP_200_OK)

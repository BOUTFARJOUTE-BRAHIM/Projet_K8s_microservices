"""
=============================================================
User Service - Vues (Views) REST
=============================================================

Vues basées sur les fonctions pour la gestion CRUD des utilisateurs.
Le format de réponse JSON est cohérent avec les autres microservices
(success, data, count, message).
"""

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import User
from .serializers import UserSerializer


@api_view(['GET', 'POST'])
def user_list(request):
    """
    GET  /api/users/  → Liste de tous les utilisateurs
    POST /api/users/  → Créer un nouvel utilisateur (inscription)
    """
    if request.method == 'GET':
        return _list_users(request)
    elif request.method == 'POST':
        return _create_user(request)


@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
    """
    GET    /api/users/<id>/  → Détail d'un utilisateur
    PUT    /api/users/<id>/  → Modifier un utilisateur
    DELETE /api/users/<id>/  → Supprimer un utilisateur
    """
    # Vérifier que l'utilisateur existe
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': f"Utilisateur avec l'ID {pk} non trouvé"
        }, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return _get_user(user)
    elif request.method == 'PUT':
        return _update_user(request, user)
    elif request.method == 'DELETE':
        return _delete_user(user)


# =============================================================
# Fonctions internes
# =============================================================

def _list_users(request):
    """Retourne la liste de tous les utilisateurs actifs."""
    # Filtre optionnel par statut actif
    is_active = request.query_params.get('active')
    users = User.objects.all()

    if is_active is not None:
        is_active_bool = is_active.lower() in ('true', '1', 'yes')
        users = users.filter(is_active=is_active_bool)

    serializer = UserSerializer(users, many=True)
    return Response({
        'success': True,
        'count': len(serializer.data),
        'data': serializer.data
    }, status=status.HTTP_200_OK)


def _create_user(request):
    """Crée un nouvel utilisateur."""
    serializer = UserSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Données invalides',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    return Response({
        'success': True,
        'message': f'Utilisateur "{serializer.data["username"]}" créé avec succès',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


def _get_user(user):
    """Retourne le détail d'un utilisateur."""
    serializer = UserSerializer(user)
    return Response({
        'success': True,
        'data': serializer.data
    }, status=status.HTTP_200_OK)


def _update_user(request, user):
    """Met à jour un utilisateur existant."""
    serializer = UserSerializer(user, data=request.data, partial=True)

    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Données invalides',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    serializer.save()
    return Response({
        'success': True,
        'message': f'Utilisateur "{serializer.data["username"]}" mis à jour',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


def _delete_user(user):
    """Supprime un utilisateur."""
    username = user.username
    user.delete()
    return Response({
        'success': True,
        'message': f'Utilisateur "{username}" supprimé avec succès'
    }, status=status.HTTP_200_OK)

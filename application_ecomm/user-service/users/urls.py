"""
=============================================================
User Service - Routes de l'app users
=============================================================

Routes REST pour la gestion des utilisateurs :

  GET    /api/users/        → Liste des utilisateurs
  POST   /api/users/        → Créer un utilisateur
  GET    /api/users/<id>/   → Détail d'un utilisateur
  PUT    /api/users/<id>/   → Modifier un utilisateur
  DELETE /api/users/<id>/   → Supprimer un utilisateur
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.user_list, name='user-list'),
    path('<int:pk>/', views.user_detail, name='user-detail'),
]

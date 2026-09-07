"""
=============================================================
Review Service - Routes de l'app reviews
=============================================================

Routes REST pour la gestion des avis produits :

  GET    /api/reviews/                          → Liste des avis (filtrable par product_id)
  POST   /api/reviews/                          → Soumettre un avis
  GET    /api/reviews/<id>/                     → Détail d'un avis
  DELETE /api/reviews/<id>/                     → Supprimer un avis
  GET    /api/reviews/product/<id>/stats/       → Statistiques d'un produit
"""

from django.urls import path
from . import views

urlpatterns = [
    path('', views.review_list, name='review-list'),
    path('<int:pk>/', views.review_detail, name='review-detail'),
    path('product/<int:product_id>/stats/', views.product_review_stats, name='product-review-stats'),
]

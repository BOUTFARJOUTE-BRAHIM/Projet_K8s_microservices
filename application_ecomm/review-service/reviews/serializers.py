"""
=============================================================
Review Service - Sérialiseurs DRF
=============================================================

Sérialiseurs pour convertir les objets Review en JSON et valider
les données entrantes.
"""

from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour le modèle Review.
    """

    class Meta:
        model = Review
        fields = ['id', 'product_id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_rating(self, value):
        """Valide que la note est entre 1 et 5."""
        if not (1 <= value <= 5):
            raise serializers.ValidationError(
                "La note doit être comprise entre 1 et 5."
            )
        return value

    def validate_product_id(self, value):
        """Valide que le product_id est un entier positif."""
        if value <= 0:
            raise serializers.ValidationError(
                "Le product_id doit être un entier positif."
            )
        return value


class ReviewStatsSerializer(serializers.Serializer):
    """
    Sérialiseur pour les statistiques d'avis d'un produit.
    """
    product_id = serializers.IntegerField()
    average_rating = serializers.FloatField()
    total_reviews = serializers.IntegerField()
    rating_distribution = serializers.DictField(
        child=serializers.IntegerField()
    )

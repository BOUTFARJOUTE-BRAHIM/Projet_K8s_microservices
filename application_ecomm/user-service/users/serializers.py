"""
=============================================================
User Service - Sérialiseurs DRF
=============================================================

Sérialiseurs pour convertir les objets User en JSON et valider
les données entrantes.
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour le modèle User.
    Utilisé pour les opérations CRUD.
    """

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'phone', 'address', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_email(self, value):
        """Valide que l'email est unique (en excluant l'instance actuelle)."""
        instance = self.instance
        if User.objects.filter(email=value).exclude(
            pk=instance.pk if instance else None
        ).exists():
            raise serializers.ValidationError(
                "Un utilisateur avec cet email existe déjà."
            )
        return value

    def validate_username(self, value):
        """Valide que le username est unique (en excluant l'instance actuelle)."""
        instance = self.instance
        if User.objects.filter(username=value).exclude(
            pk=instance.pk if instance else None
        ).exists():
            raise serializers.ValidationError(
                "Un utilisateur avec ce nom d'utilisateur existe déjà."
            )
        return value

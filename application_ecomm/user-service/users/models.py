"""
=============================================================
User Service - Modèle User (PostgreSQL)
=============================================================

Ce modèle mappe la table "users" créée par init-db.sql.
managed = False signifie que Django ne gère pas les migrations
de cette table (elle est créée via le script SQL).
"""

from django.db import models


class User(models.Model):
    """
    Modèle représentant un utilisateur de la plateforme e-commerce.
    Correspond à la table PostgreSQL "users".
    """
    id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=100, default='')
    last_name = models.CharField(max_length=100, default='')
    phone = models.CharField(max_length=20, default='', blank=True)
    address = models.TextField(default='', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        managed = False
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.email})"

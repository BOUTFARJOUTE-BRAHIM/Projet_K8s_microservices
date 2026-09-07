"""
=============================================================
Review Service - Modèle Review (PostgreSQL)
=============================================================

Ce modèle mappe la table "reviews" créée par init-db.sql.
managed = False signifie que Django ne gère pas les migrations
de cette table (elle est créée via le script SQL).
"""

from django.db import models


class Review(models.Model):
    """
    Modèle représentant un avis sur un produit.
    Correspond à la table PostgreSQL "reviews".
    """
    id = models.AutoField(primary_key=True)
    product_id = models.IntegerField()
    user_name = models.CharField(max_length=150)
    rating = models.IntegerField()
    comment = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        managed = False
        ordering = ['-created_at']

    def __str__(self):
        return f"Review #{self.id} - Product {self.product_id} - {self.rating}★ by {self.user_name}"

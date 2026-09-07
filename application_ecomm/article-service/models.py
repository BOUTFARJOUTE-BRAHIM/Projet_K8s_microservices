"""
=============================================================
Article Service - Modèle de données
=============================================================

Modèle SQLAlchemy pour la table "articles".
Chaque article représente un contenu éditorial (blog, actualité)
associé à la plateforme e-commerce.
"""

from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Article(db.Model):
    """
    Modèle représentant un article (blog / actualité).

    Colonnes :
        id         - Identifiant unique auto-incrémenté
        title      - Titre de l'article
        content    - Corps / contenu de l'article
        author     - Nom de l'auteur
        category   - Catégorie (ex : Tech, E-commerce, Tutoriel)
        image      - URL de l'image d'illustration
        published  - Indique si l'article est publié ou en brouillon
        created_at - Date de création
        updated_at - Date de dernière modification
    """

    __tablename__ = 'articles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False, default='Général')
    image = db.Column(db.Text, nullable=True)
    published = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime, nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self):
        """Convertit l'article en dictionnaire JSON-sérialisable."""
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author': self.author,
            'category': self.category,
            'image': self.image,
            'published': self.published,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Article {self.id}: {self.title}>'

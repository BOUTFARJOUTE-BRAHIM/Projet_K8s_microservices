"""
=============================================================
Article Service - Routes CRUD des articles
=============================================================

Routes REST pour la gestion des articles :

  GET    /api/articles           → Liste des articles (filtrage par catégorie, auteur)
  GET    /api/articles/<id>      → Détail d'un article
  POST   /api/articles           → Créer un article
  PUT    /api/articles/<id>      → Modifier un article
  DELETE /api/articles/<id>      → Supprimer un article
"""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify

from models import db, Article

articles_bp = Blueprint('articles', __name__)


# =============================================================
# GET /api/articles — Liste des articles
# =============================================================
@articles_bp.route('/', methods=['GET'])
def get_articles():
    """
    Retourne la liste de tous les articles.

    Query params optionnels :
        - category : filtrer par catégorie (insensible à la casse)
        - author   : filtrer par auteur (insensible à la casse)
        - published: filtrer par statut de publication (true/false)
    """
    try:
        query = Article.query

        # Filtre par catégorie
        category = request.args.get('category')
        if category:
            query = query.filter(Article.category.ilike(category))

        # Filtre par auteur
        author = request.args.get('author')
        if author:
            query = query.filter(Article.author.ilike(f'%{author}%'))

        # Filtre par statut de publication
        published = request.args.get('published')
        if published is not None:
            is_published = published.lower() in ('true', '1', 'yes')
            query = query.filter(Article.published == is_published)

        # Tri par date de création décroissante (plus récent en premier)
        articles = query.order_by(Article.created_at.desc()).all()

        return jsonify({
            'success': True,
            'count': len(articles),
            'data': [article.to_dict() for article in articles]
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Erreur serveur lors de la récupération des articles',
            'error': str(e)
        }), 500


# =============================================================
# GET /api/articles/<id> — Détail d'un article
# =============================================================
@articles_bp.route('/<int:article_id>', methods=['GET'])
def get_article(article_id):
    """Retourne le détail d'un article par son ID."""
    try:
        article = db.session.get(Article, article_id)

        if not article:
            return jsonify({
                'success': False,
                'message': f"Article avec l'ID {article_id} non trouvé"
            }), 404

        return jsonify({
            'success': True,
            'data': article.to_dict()
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': "Erreur serveur lors de la récupération de l'article",
            'error': str(e)
        }), 500


# =============================================================
# POST /api/articles — Créer un article
# =============================================================
@articles_bp.route('/', methods=['POST'])
def create_article():
    """
    Crée un nouvel article.

    Body JSON attendu :
        - title    (requis)  : Titre de l'article
        - content  (requis)  : Contenu de l'article
        - author   (requis)  : Nom de l'auteur
        - category (optionnel) : Catégorie (défaut: 'Général')
        - image    (optionnel) : URL de l'image
        - published(optionnel) : Publié ou non (défaut: false)
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'Le corps de la requête doit être du JSON valide'
            }), 400

        # Validation des champs requis
        required_fields = ['title', 'content', 'author']
        missing = [f for f in required_fields if not data.get(f)]

        if missing:
            return jsonify({
                'success': False,
                'message': f"Champ(s) requis manquant(s) : {', '.join(missing)}"
            }), 400

        # Validation : le titre ne doit pas être vide
        if len(data['title'].strip()) == 0:
            return jsonify({
                'success': False,
                'message': 'Le titre ne peut pas être vide'
            }), 400

        # Création de l'article
        article = Article(
            title=data['title'].strip(),
            content=data['content'].strip(),
            author=data['author'].strip(),
            category=data.get('category', 'Général').strip(),
            image=data.get('image'),
            published=data.get('published', False)
        )

        db.session.add(article)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Article créé avec succès',
            'data': article.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': "Erreur serveur lors de la création de l'article",
            'error': str(e)
        }), 500


# =============================================================
# PUT /api/articles/<id> — Modifier un article
# =============================================================
@articles_bp.route('/<int:article_id>', methods=['PUT'])
def update_article(article_id):
    """
    Met à jour un article existant.

    Seuls les champs fournis dans le body JSON seront modifiés.
    """
    try:
        article = db.session.get(Article, article_id)

        if not article:
            return jsonify({
                'success': False,
                'message': f"Article avec l'ID {article_id} non trouvé"
            }), 404

        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'Le corps de la requête doit être du JSON valide'
            }), 400

        # Mise à jour des champs fournis
        if 'title' in data:
            if len(data['title'].strip()) == 0:
                return jsonify({
                    'success': False,
                    'message': 'Le titre ne peut pas être vide'
                }), 400
            article.title = data['title'].strip()

        if 'content' in data:
            article.content = data['content'].strip()

        if 'author' in data:
            article.author = data['author'].strip()

        if 'category' in data:
            article.category = data['category'].strip()

        if 'image' in data:
            article.image = data['image']

        if 'published' in data:
            article.published = bool(data['published'])

        article.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Article mis à jour avec succès',
            'data': article.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': "Erreur serveur lors de la mise à jour de l'article",
            'error': str(e)
        }), 500


# =============================================================
# DELETE /api/articles/<id> — Supprimer un article
# =============================================================
@articles_bp.route('/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    """Supprime un article par son ID."""
    try:
        article = db.session.get(Article, article_id)

        if not article:
            return jsonify({
                'success': False,
                'message': f"Article avec l'ID {article_id} non trouvé"
            }), 404

        db.session.delete(article)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f"Article '{article.title}' supprimé avec succès"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': "Erreur serveur lors de la suppression de l'article",
            'error': str(e)
        }), 500

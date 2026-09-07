"""
=============================================================
Article Service - Application Flask
=============================================================

Point d'entrée du microservice Article.

Fonctionnalités :
  - CRUD complet pour les articles (blog / actualités)
  - Health Check pour Kubernetes
  - Connexion à PostgreSQL via SQLAlchemy

Port par défaut : 5001

Ce microservice est conçu pour être déployé dans un cluster
Kubernetes et communiquer avec les autres services via DNS interne.
"""

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from models import db
from routes.articles import articles_bp


def create_app(config_class=Config):
    """
    Factory pour créer et configurer l'application Flask.

    Utilise le pattern Application Factory pour faciliter les tests
    et permettre de créer plusieurs instances avec des configurations
    différentes.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # =============================================================
    # Extensions
    # =============================================================
    CORS(app)
    db.init_app(app)

    # Créer les tables si elles n'existent pas
    with app.app_context():
        db.create_all()

    # =============================================================
    # Routes
    # =============================================================

    # Health Check — utilisé par Kubernetes
    @app.route('/health')
    def health():
        return jsonify({
            'service': 'article-service',
            'status': 'UP',
            'timestamp': __import__('datetime').datetime.now(
                __import__('datetime').timezone.utc
            ).isoformat()
        }), 200

    # Routes des articles
    app.register_blueprint(articles_bp, url_prefix='/api/articles')

    # Gestion des routes non trouvées (404)
    @app.errorhandler(404)
    def not_found(error):
        from flask import request
        return jsonify({
            'success': False,
            'message': f"Route {request.url} non trouvée sur le Article Service"
        }), 404

    return app


# =============================================================
# Démarrage du serveur (développement)
# =============================================================
if __name__ == '__main__':
    app = create_app()
    port = Config.SERVICE_PORT
    print(f"\n🚀 Article Service démarré avec succès !")
    print(f"📝 URL : http://0.0.0.0:{port}")
    print(f"❤️  Health Check : http://0.0.0.0:{port}/health")
    print(f"📋 Articles : http://0.0.0.0:{port}/api/articles\n")
    app.run(host='0.0.0.0', port=port, debug=True)

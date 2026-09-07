"""
=============================================================
User Service - URLs racine
=============================================================
"""

from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """Health Check - utilisé par Kubernetes."""
    from datetime import datetime
    return JsonResponse({
        'service': 'user-service',
        'status': 'UP',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    })


urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('api/users/', include('users.urls')),
]

# Pymarket/asgi.py

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Pymarket.settings')

# Import AFTER setting DJANGO_SETTINGS_MODULE
import chatapp.routing
from chatapp.middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(
                chatapp.routing.websocket_urlpatterns
            )
        )
    ),
})
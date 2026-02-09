from django.urls import re_path
from backend_api.consumers import WebRTCConsumer

websocket_urlpatterns = [
    re_path(r'ws/webrtc/$', WebRTCConsumer.as_asgi()),
]
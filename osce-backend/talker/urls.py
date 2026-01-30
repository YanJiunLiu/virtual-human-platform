from rest_framework.routers import DefaultRouter
from django.urls import path
from talker.views import (
    ChatViewSet, 
    TalkerSpectacularAPIView, 
    TalkerSpectacularSwaggerView
)



router = DefaultRouter()
router.register(r"chat", ChatViewSet, basename="chat")

urlpatterns = router.urls + [
    path('schema/', TalkerSpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', TalkerSpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui')
]
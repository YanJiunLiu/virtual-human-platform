from rest_framework.routers import DefaultRouter
from django.urls import path
from mgmt.views import (
    RoleViewSet,
    UserViewSet,
    SchoolDepartmentViewSet,
    GroupViewSet,
    MgmtSpectacularAPIView,
    MgmtSpectacularSwaggerView
)

router = DefaultRouter()
router.register(r"role", RoleViewSet, basename="role")
router.register(r"user", UserViewSet, basename="user")
router.register(r"school_department", SchoolDepartmentViewSet, basename="school_department")
router.register(r"group", GroupViewSet, basename="group")
urlpatterns = router.urls

urlpatterns += [
    path('schema/', MgmtSpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', MgmtSpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui')
]

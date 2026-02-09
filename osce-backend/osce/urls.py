from rest_framework.routers import DefaultRouter
from django.urls import path
from osce.views import (
    DepartmentViewSet,
    MedicalHistoryViewSet,
    StandardizedPatientViewSet,
    CaseViewSet,
    TestResultsViewSet,
    OsceSpectacularAPIView,
    OsceSpectacularSwaggerView
)

router = DefaultRouter()
router.register(r"departments", DepartmentViewSet, basename="departments")
router.register(r"medicalhistory", MedicalHistoryViewSet, basename="medicalhistory")
router.register(r"standardizedpatients", StandardizedPatientViewSet, basename="standardizedpatients")
router.register(r"case", CaseViewSet, basename="case")
router.register(r"testresults", TestResultsViewSet, basename="testresults")
urlpatterns = router.urls

urlpatterns += [
    path('schema/', OsceSpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', OsceSpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui')
]

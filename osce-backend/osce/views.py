from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework import mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, JSONParser
from osce.models import (
    StandardizedPatient,
    Department,
    MedicalHistory,
    Case,
    TestResults
)
from osce.serializers import (
    StandardizedPatientSerializer,
    StandardizedPatientSchemaSerializer,
    StandardizedPatientListSerializer,
    DepartmentSerializer,
    DepartmentListSerializer,
    MedicalHistorySerializer,
    CaseSerializer,
    CaseListSerializer,
    DepartmentTestListSerializer,
    TestResultsSerializer
)
from osce.decorators import osce
from drf_spectacular.views import (
    get_relative_url, set_query_parameters, reverse, SpectacularAPIView, SpectacularSwaggerView
)
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view
)
from osce.permissions import PermissionViewSetMixin

# Create your views here.
@extend_schema(tags=["標病管理"])
@extend_schema_view(
    list=extend_schema(
        description="List all standard patients.",
        responses={
            "application/json": StandardizedPatientListSerializer,
        }
    ),
    create=extend_schema(
        description="Add a new standard patient.",
        request={
            "multipart/form-data": StandardizedPatientSchemaSerializer,
        },
    ),
    destroy=extend_schema(
        description="Delete a standard patient."
    ),
    update=extend_schema(
        description="Update a specific standard patient.",
        request={
            "multipart/form-data": StandardizedPatientSchemaSerializer,
        },
        responses={201: StandardizedPatientSerializer},
    )
)
class StandardizedPatientViewSet(PermissionViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StandardizedPatientSerializer
    queryset = StandardizedPatient.objects.all()
    pagination_class = PageNumberPagination
    parser_classes = [MultiPartParser, JSONParser]

    def get_serializer_class(self):
        """
        Return the class to use for the serializer.
        Defaults to using `self.serializer_class`.

        You may want to override this if you need to provide different
        serializations depending on the incoming request.

        (Eg. admins get full serialization, others get basic serialization)
        """
        assert self.serializer_class is not None, (
                "'%s' should either include a `serializer_class` attribute, "
                "or override the `get_serializer_class()` method."
                % self.__class__.__name__
        )
        if self.action.lower() == "list":
            return StandardizedPatientListSerializer
        else:
            return self.serializer_class


    @osce()
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



@extend_schema(tags=["科別管理"])
@extend_schema_view(
    list=extend_schema(
        description="List all department.",
        responses = {200: DepartmentListSerializer},
    ),
    create=extend_schema(
        description="Add a new department.",
        request=DepartmentSerializer,
        responses={201: DepartmentSerializer},
    ),
    destroy=extend_schema(
        description="Delete a department."
    ),
    update=extend_schema(
        description="Update a specific department.",
        request=DepartmentSerializer,
        responses={201: DepartmentSerializer},
    ),
    medicalhistory=extend_schema(
        description="Retrieve a specific department.",
        responses={200: MedicalHistorySerializer},
    ),
)
class DepartmentViewSet(
        mixins.CreateModelMixin,
        mixins.UpdateModelMixin,
        mixins.DestroyModelMixin,
        mixins.ListModelMixin,
        viewsets.GenericViewSet
    ):
    permission_classes = [IsAuthenticated]
    serializer_class = DepartmentSerializer
    queryset = Department.objects.all()
    pagination_class = PageNumberPagination

    def get_serializer_class(self):
        """
        Return the class to use for the serializer.
        Defaults to using `self.serializer_class`.

        You may want to override this if you need to provide different
        serializations depending on the incoming request.

        (Eg. admins get full serialization, others get basic serialization)
        """
        assert self.serializer_class is not None, (
                "'%s' should either include a `serializer_class` attribute, "
                "or override the `get_serializer_class()` method."
                % self.__class__.__name__
        )
        if self.action.lower() == "list":
            return DepartmentListSerializer
        else:
            return self.serializer_class

    @action(
        detail=True,
        methods=["get"],
        serializer_class=MedicalHistorySerializer
    )
    def medicalhistory(self, request, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance.medical_history, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], serializer_class=DepartmentTestListSerializer)
    def list_test(self, request, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        res = []
        for department in queryset:
            department_serializer = DepartmentListSerializer(department)
            department_data = department_serializer.data
            page = self.paginate_queryset(department.case_set.all())
            test_serializer = self.get_serializer(department.case_set.all(), many=True)
            if page is not None:
                test_serializer = self.get_serializer(page, many=True)
            department_data["tests"] = test_serializer.data
            res.append(department_data)
        return self.get_paginated_response(data=res)

@extend_schema(tags=["病史管理"])
@extend_schema_view(
    destroy=extend_schema(
        description="Delete a user."
    ),
)
class MedicalHistoryViewSet(
        mixins.DestroyModelMixin,
        viewsets.GenericViewSet
    ):
    permission_classes = [IsAuthenticated]
    serializer_class = MedicalHistorySerializer
    queryset = MedicalHistory.objects.all()
    pagination_class = PageNumberPagination


@extend_schema(tags=["教案管理"])
class CaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CaseSerializer
    queryset = Case.objects.all()
    pagination_class = PageNumberPagination

    def get_serializer_class(self):
        """
        Return the class to use for the serializer.
        Defaults to using `self.serializer_class`.

        You may want to override this if you need to provide different
        serializations depending on the incoming request.

        (Eg. admins get full serialization, others get basic serialization)
        """
        assert self.serializer_class is not None, (
                "'%s' should either include a `serializer_class` attribute, "
                "or override the `get_serializer_class()` method."
                % self.__class__.__name__
        )
        if self.action.lower() in ["list", "retrieve"]:
            return CaseListSerializer
        else:
            return self.serializer_class

@extend_schema(tags=["測試結果管理"])
class TestResultsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TestResultsSerializer
    queryset = TestResults.objects.all()
    pagination_class = PageNumberPagination

@extend_schema(exclude=True)
class  OsceSpectacularAPIView(SpectacularAPIView):
    """
        OpenApi3 schema for this API. Format can be selected via content negotiation.

        - YAML: application/vnd.oai.openapi
        - JSON: application/vnd.oai.openapi+json
    """

class OsceSpectacularSwaggerView(SpectacularSwaggerView):
    def _get_schema_url(self, request):
        schema_url = self.url or get_relative_url(reverse(f"osce:{self.url_name}", request=request))
        return set_query_parameters(
            url=schema_url,
            lang=request.GET.get('lang'),
            version=request.GET.get('version')
        )

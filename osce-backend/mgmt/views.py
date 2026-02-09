from rest_framework import viewsets, mixins, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from mgmt.serializers import (
    UserSerializer,
    UserGetSerializer,
    BasicUserSerializer,
    LoginSerializer,
    SchoolDepartmentSerializer,
    GroupSerializer,
    RoleSerializer,
    User,
    SchoolDepartment,
    Group,
    Role
)

from mgmt.authenticate import authenticate_teacher, authenticate_user
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view
)
from drf_spectacular.views import (
    get_relative_url, set_query_parameters, reverse, SpectacularAPIView, SpectacularSwaggerView
)
from rest_framework.exceptions import AuthenticationFailed
from mgmt.permissions import PermissionViewSetMixin

@extend_schema(tags=["Role Management"])
class RoleViewSet(PermissionViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = RoleSerializer
    queryset = Role.objects.all()
    pagination_class = PageNumberPagination


# Create your views here.
@extend_schema(tags=["User Management"])
@extend_schema_view(
    list=extend_schema(
        description="List all user.",
        responses={200: UserGetSerializer},
    ),
    create=extend_schema(
        description="Add a new user.",
        request=UserSerializer,
        responses={201: UserSerializer},
    ),
    destroy=extend_schema(
        description="Delete a user."
    ),
    retrieve=extend_schema(
        description="Retrieve a specific user.",
        responses={200: UserGetSerializer},
    ),
    update=extend_schema(
        description="Update a specific user.",
        request=UserSerializer,
        responses={201: UserSerializer},
    ),
    partial_update=extend_schema(
        description="Partially modify a specific user.",
        request=UserSerializer,
        responses={201: UserSerializer},
    ),
    admin_login= extend_schema(
        request=BasicUserSerializer,
        responses={201: LoginSerializer},
    ),
    user_login=extend_schema(
        request=BasicUserSerializer,
        responses={201: LoginSerializer},
    ),
    logout=extend_schema(
        request=BasicUserSerializer,
        responses={201: LoginSerializer},
    )
)
class UserViewSet(
    PermissionViewSetMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet):
    """
    ViewSet for viewing, editing, and managing user accounts
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all()
    pagination_class = PageNumberPagination

    def get_serializer_class(self):
        if self.action and self.action.lower() in ['list', 'retrieve']:
            return UserGetSerializer
        return self.serializer_class

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]


    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        serializer_class=BasicUserSerializer
    )
    def admin_login(self, request, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.validated_data["account"]
        password = serializer.validated_data["password"]
        user = authenticate_teacher(request, username=account, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token": f"Token {token.key}",
                    "message": "Login successful",
                    "state": "success",
                    "account": user.account,
                    "username": user.username
                }, status=status.HTTP_201_CREATED)
        else:
            raise AuthenticationFailed(detail="Invalid credentials")


    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        serializer_class=BasicUserSerializer
    )
    def user_login(self, request, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = serializer.validated_data["account"]
        password = serializer.validated_data["password"]
        user = authenticate_user(request, username=account, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "token": f"Token {token.key}",
                    "message": "Login successful",
                    "state": "success",
                    "account": user.account,
                    "username": user.username
                }, status=status.HTTP_201_CREATED)
        else:
            raise AuthenticationFailed(detail="Invalid credentials")


    @action(
        detail=False,
        methods=["post"],
        serializer_class=None,
        permission_classes=[IsAuthenticated]
    )
    def logout(self, request, **kwargs):
        request.user.auth_token.delete()
        return Response({"message": "Logout successful"})

@extend_schema(tags=["School Department Management"])
class SchoolDepartmentViewSet( PermissionViewSetMixin, viewsets.ModelViewSet):
    """
    ViewSet for viewing, editing, and managing user accounts
    """
    permission_classes = [IsAuthenticated]
    serializer_class = SchoolDepartmentSerializer
    queryset = SchoolDepartment.objects.all()
    pagination_class = PageNumberPagination

@extend_schema(tags=["Group Management"])
class GroupViewSet( PermissionViewSetMixin, viewsets.ModelViewSet):
    """
    ViewSet for viewing, editing, and managing user accounts
    """
    permission_classes = [IsAuthenticated]
    serializer_class = GroupSerializer
    queryset = Group.objects.all()
    pagination_class = PageNumberPagination

@extend_schema(exclude=True)
class MgmtSpectacularAPIView(SpectacularAPIView):
    """
        OpenApi3 schema for this API. Format can be selected via content negotiation.

        - YAML: application/vnd.oai.openapi
        - JSON: application/vnd.oai.openapi+json
    """

class MgmtSpectacularSwaggerView(SpectacularSwaggerView):
    def _get_schema_url(self, request):
        schema_url = self.url or get_relative_url(reverse(f"mgmt:{self.url_name}", request=request))
        return set_query_parameters(
            url=schema_url,
            lang=request.GET.get('lang'),
            version=request.GET.get('version')
        )
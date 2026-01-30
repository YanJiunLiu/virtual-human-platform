import rules
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import BaseUserManager, _user_has_perm
from django.db.models import Model, CharField, BooleanField, DateTimeField, ManyToManyField, ForeignKey, CASCADE, SET_NULL
from rules.contrib.models import RulesModel, RulesModelMixin, RulesModelBase
from mgmt.roles import (
    builtin_user_roles,
    UserAdministrator,
    GroupAdministrator,
    SystemManagementAdministrator
)
from django.utils.functional import cached_property

# Create your models here.

class Role(RulesModel):
    name = CharField(unique=True, max_length=255)
    description = CharField(blank=True, max_length=255)


    class Meta:
        rules_permissions = {
            "add": UserAdministrator().has_role(),
            "view": UserAdministrator().has_role(),
            "list": UserAdministrator().has_role(),
            "change": UserAdministrator().has_role(),
            "delete": UserAdministrator().has_role(),
        }

class Group(RulesModel):
    name = CharField( max_length=255, null=False, blank=False)
    created = DateTimeField(auto_now_add=True)
    members = ManyToManyField("User", blank=True, related_name="members")
    created_by = ForeignKey('User', on_delete=CASCADE)

    class Meta:
        rules_permissions = {
            "add": GroupAdministrator().has_role(),
            "view": GroupAdministrator().has_role(),
            "list": rules.always_allow,
            "change": GroupAdministrator().has_role(),
            "delete": GroupAdministrator().has_role(),
        }

class RoleMixin(Model):
    """
    Add the fields and methods necessary to support the RBAC
    models using the ModelBackend.
    """
    role = ForeignKey('Role', on_delete=SET_NULL, null=True, blank=True)

    class Meta:
        abstract = True

    @cached_property
    def _role_names_cache(self) -> set:
        # Initialize the role names cache with the base role names
        role_names_cache = {self.role.name}
        try:
            b_r = builtin_user_roles.get(self.role.name)
            role_base_roles = b_r.get_base_roles(b_r)
            role_names_cache.update(role_base_roles)
        except (TypeError, AttributeError):
            # If the role is not found in builtin_user_roles or is deprecated, ignore it
            pass
        return role_names_cache

    def has_role(self, role_list):
        """
        Return True if the user has each of the specified roles.
        """
        return set(role_list).issubset(self._role_names_cache)

class PermissionsMixin(Model):
    """
        if using 'django.contrib.auth.backends.ModelBackend' in settings.AUTHENTICATION_BACKENDS,
        from django.contrib.auth.models import PermissionsMixin
    """

    is_superuser = BooleanField(default=False)
    is_active = BooleanField(default=True)

    class Meta:
        abstract = True



    def has_perm(self, perm, obj=None):
        """
        Return True if the user has the specified permission. Query all
        available auth backends, but return immediately if any backend returns
        True. Thus, a user who has permission from a single auth backend is
        assumed to have permission in general. If an object is provided, check
        permissions for that object.
        """
        # Active superusers have all permissions.
        if self.is_active and self.is_superuser:
            return True

        # Otherwise we need to check the backends.
        return _user_has_perm(self, perm, obj)

class UserManager(BaseUserManager):
    def get_by_natural_key(self, username):
        # handler get account
        return self.get(**{self.model.USERNAME_FIELD: username})

    def create_user(
            self,
            account,
            username,
            password=None,
            role_name=None,
            **kwargs
    ):
        user = self.model(
            account=account,
            username=username,
            last_name=username,
            **kwargs
        )

        if password is None:
            user.set_unusable_password()
        else:
            user.set_password(password)
        if role_name and Role.objects.filter(name=role_name).exists():
            user.role = Role.objects.get(name=role_name)
        user.save(using=self._db)
        return user

    def create_superuser(
            self,
            account,
            username,
            password=None
    ):
        user = self.create_user(account, username, password)
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(RulesModelMixin, PermissionsMixin, RoleMixin, AbstractBaseUser, metaclass=RulesModelBase):
    account = CharField( max_length=255, unique=True, null=False, blank=False)
    password = CharField(max_length=255, null=False)
    username = CharField(max_length=255, null=False)
    first_name = CharField(max_length=255, null=True, blank=True)
    last_name = CharField(max_length=255, null=False)
    alias_name = CharField(max_length=255, null=True, blank=True)
    email = CharField(max_length=255, null=True, blank=True)
    serial = CharField(max_length=255, null=True, blank=True)
    school_department = ForeignKey('SchoolDepartment', on_delete=SET_NULL, null=True, blank=True)
    created = DateTimeField(auto_now_add=True)
    last_login = DateTimeField(auto_now=True)
    objects = UserManager()

    USERNAME_FIELD = "account"
    REQUIRED_FIELDS = ["password", "username"]

    class Meta:
        rules_permissions = {
            "add": UserAdministrator().has_role(),
            "view": UserAdministrator().has_role(),
            "list": UserAdministrator().has_role(),
            "change": UserAdministrator().has_role(),
            "delete": UserAdministrator().has_role(),
        }

class SchoolDepartment(RulesModel):
    name = CharField( max_length=255, null=False, blank=False, unique=True)

    class Meta:
        rules_permissions = {
            "add": SystemManagementAdministrator().has_role(),
            "view": SystemManagementAdministrator().has_role(),
            "list": rules.always_allow,
            "change": SystemManagementAdministrator().has_role(),
            "delete": SystemManagementAdministrator().has_role(),
        }
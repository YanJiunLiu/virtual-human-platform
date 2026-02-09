from mgmt.predicates import (
    OwnerPredicateMixin
)
from abc import ABC
from functools import lru_cache

from django.conf import settings
from django.utils.functional import classproperty
from django.utils.translation import gettext_lazy as _
from rules import predicate


def _role_format_name(cls):
    result = []
    name = [*cls.__name__]

    for i in range(len(name)):
        c = name[i]
        if i == 0:
            if "a" <= c <= "z":
                c = chr(ord(name[i]) - 32)
        elif "A" <= c <= "Z":
            c = chr(ord(name[i]) + 32)
            result.append(" ")
        result.append(c)
    return "".join(result)

@lru_cache(2048)
def cache_role_name(cls):
    return _role_format_name(cls)

class AbstractBaseRole(ABC):
    """
    Base class for all role definition
    A role is a logical grouping of permission predicates relevant to the role.
    The role predicates (class methods) should be implemented as Mixins and
    related roles can inherit the Mixins to extend permission checking capabilities.
    While the predicates all role requires can be implemented in this base class,
    the role name is programmatically derived by tokenizing role class name by
    capital letter and adding space among them.
    e.g. AbstractBaseRole -> "Abstract base role"
    """

    base_roles = []
    description = ""

    @classmethod
    def has_role(cls, *roles):
        if len(roles) > 0:
            role_list = [r.name for r in roles]
        else:
            role_list = [cls.name]

        if len(role_list) > 3:
            g = role_list[:3] + ["..."]
        else:
            g = role_list

        name = "has_role:%s" % ",".join(g)

        @predicate(name=name, bind=True)
        def fn(self, user, target):
            if not hasattr(user, "role"):
                return False  # doesn't have roles
            self.context["role"] = role_list
            return user.has_role(role_list)

        return fn

    @classproperty
    def name(cls):
        return cache_role_name(cls)

    @staticmethod
    @lru_cache(2048)
    def get_base_roles(role_obj) -> set:
        """
        Return a set of roles derived from the base roles of the class.
        """
        roles = set()
        for role in role_obj.base_roles:
            # Recursively get roles from base roles
            roles.update(role.get_base_roles(role))
            # Add the current role's name to attributes
            roles.add(role().name)
        return roles


class TestResultAdministrator(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can manage all aspects of test results, including deactivating test results.")

class TestResultWriter(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can create and edit all aspects of test results, including deactivating test results.")

class TestResultViewer(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can create and edit all aspects of test results, including deactivating test results.")

class GroupAdministrator(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can manage all aspects of groups, including deactivating groups.")

class UserAdministrator(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can manage all aspects of user accounts and roles, including deactivating users.")

class StandardizedPatientAdministrator(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can manage all aspects of standardized patients, including deactivating standardized patients.")

class CaseAdministrator(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can manage all aspects of case, including deactivating case.")

class CaseWriter(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can create and edit all aspects of case, including deactivating case.")

class CaseViewer(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can create and edit all aspects of case, including deactivating case.")

class SystemManagementAdministrator(OwnerPredicateMixin, AbstractBaseRole):
    description = _("Can manage all aspects of system settings, including deactivating system settings.")

class Administrator(OwnerPredicateMixin, AbstractBaseRole):
    base_roles = [
        TestResultAdministrator,
        GroupAdministrator,
        UserAdministrator,
        StandardizedPatientAdministrator,
        CaseAdministrator,
        SystemManagementAdministrator
    ]
    description = _("Can manage all aspects of the platform and system services.")

class Stuff(OwnerPredicateMixin, AbstractBaseRole):
    base_roles = [
        TestResultAdministrator,
        StandardizedPatientAdministrator,
        CaseAdministrator
    ]
    description = _("Can manage all aspects of Course planning, Case management, Standard patient management and Test management.")

class Student(OwnerPredicateMixin, AbstractBaseRole):
    base_roles = []
    description = _("Can manage all.")

builtin_user_roles = {
    Administrator.name: Administrator,
    Stuff.name: Stuff,
    Student.name: Student
}

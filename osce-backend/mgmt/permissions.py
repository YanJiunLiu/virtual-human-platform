from rules.contrib.rest_framework import AutoPermissionViewSetMixin


class PermissionViewSetMixin(AutoPermissionViewSetMixin):
    permission_type_map = {
        **AutoPermissionViewSetMixin.permission_type_map,
        "list": "list",
        "admin_login": None,
        "user_login": None,
        "logout": None
    }
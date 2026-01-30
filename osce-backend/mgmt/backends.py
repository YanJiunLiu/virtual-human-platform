from django.contrib.auth.backends import ModelBackend


class CSMUModelBackend(ModelBackend):
    """
    Authenticates against settings.AUTH_USER_MODEL.
    """

    def get_user_permissions(self, user_obj, obj=None):
        """
            skip permission check in Permission table
        """
        return set()

    def get_group_permissions(self, user_obj, obj=None):
        """
            skip permission check in Group table
        """
        return set()
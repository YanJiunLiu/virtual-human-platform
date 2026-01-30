from django.apps import AppConfig
from django.db.models.signals import post_migrate
from mgmt.roles import builtin_user_roles

class MgmtConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mgmt'

    def ready(self):
        post_migrate.connect(create_user_roles, sender=self)
        post_migrate.connect(create_superuser, sender=self)
        post_migrate.connect(create_users, sender=self)


def create_user_roles(sender, **kwargs):
    from mgmt.models import Role

    for name, cls in builtin_user_roles.items():
        _, _ = Role.objects.update_or_create(name=name, defaults={"description": cls.description})

def create_superuser(sender, **kwargs):
    from mgmt.models import User
    if not User.objects.filter(account='superuser').exists():
        User.objects.create_superuser(
            account='superuser',
            username='superuser',
            password='superuser'
        )

def create_users(sender, **kwargs):
    from mgmt.models import User
    if not User.objects.filter(account='admin').exists():
        User.objects.create_user(
            account='admin',
            username='admin',
            password='admin',
            role_name = "Administrator"
        )

    if not User.objects.filter(account='stuff').exists():
        User.objects.create_user(
            account='stuff',
            username='stuff',
            password='stuff',
            role_name = "Stuff"
        )

    if not User.objects.filter(account='student').exists():
        User.objects.create_user(
            account='student',
            username='student',
            password='student',
            role_name = "Student"
        )
from rest_framework import serializers
from drf_writable_nested.serializers import WritableNestedModelSerializer
from mgmt.mixins import AppendNestedUpdateMixin

from mgmt.models import (
    User,
    SchoolDepartment,
    Group,
    Role
)
from osce.models import (
    Case,
)
from django.contrib.auth.hashers import (
    make_password,
)
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

    def to_internal_value(self, data):
        if role_name:=data.get('name'):
            if Role.objects.filter(name=role_name).exists():
                return data
            else:
                raise serializers.ValidationError('Role name not found.')
        else:
            return super(RoleSerializer, self).to_internal_value(data)

class LoginSerializer(serializers.Serializer):
    token = serializers.EmailField()
    message = serializers.CharField()
    state = serializers.CharField()

class BasicUserSerializer(serializers.ModelSerializer):
    account = serializers.CharField(help_text="Account ID.", required=True)
    password = serializers.CharField(help_text="Password.", required=True)
    class Meta:
        model = User
        fields = ["account","password", "id", "username"]
        read_only_fields = ["id", "position", "username"]

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        exclude = ['created_by']

class SchoolDepartmentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True)
    class Meta:
        model = SchoolDepartment
        fields = "__all__"

class UserSerializer(AppendNestedUpdateMixin, WritableNestedModelSerializer):
    account = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    last_name = serializers.CharField(required=False)
    first_name = serializers.CharField(required=True)
    alias_name = serializers.CharField(required=False)
    is_superuser = serializers.BooleanField(default=False, required=False)
    is_active = serializers.BooleanField(default=True, required=False)
    school_department = SchoolDepartmentSerializer(required=False)
    role = RoleSerializer(required=False)

    class Meta:
        model = User
        exclude = ["id", "created", "last_login"]

    def to_internal_value(self, data):
        # NestedCreateMixin create.update_or_create_direct_relations will get self.initial_data to create relation object
        data = super(UserSerializer, self).to_internal_value(data)
        if self.context['view'].action == 'create':
            if last_name := data.get("last_name"):
                self.initial_data['username'] = f"{last_name}{data['first_name']}"
            else:
                self.initial_data['username'] = f"{data['first_name']}"
        # encode password
        if password:= data.get("password"):
            self.initial_data['password'] = make_password(password)

        # Do not create multiple object when the school department name is duplicated.
        if school_department := data.get("school_department"):
            queryset = SchoolDepartment.objects.filter(name=school_department['name'])
            if queryset.exists():
                instance = queryset.first()
                self.initial_data['school_department'] = {field.name: getattr(instance, field.name) for field in instance._meta.fields}

        # Do not create multiple object when the role name is duplicated.
        if role := data.get("role"):
            queryset = Role.objects.filter(name=role['name'])
            if queryset.exists():
                instance = queryset.first()
                self.initial_data['role']={field.name: getattr(instance, field.name) for field in
                                                          instance._meta.fields}

        return self.initial_data

class UserGetSerializer(serializers.ModelSerializer):
    school_department = SchoolDepartmentSerializer(read_only=True)
    role = RoleSerializer(read_only=True)
    lesson_count = serializers.IntegerField(read_only=True)
    group_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        exclude = ["password"]

    def to_representation(self, instance):
        data = super(UserGetSerializer, self).to_representation(instance)
        data['case_count'] = Case.objects.filter(members=instance).count()
        data['group_count'] = Group.objects.filter(members=instance).count()
        return data
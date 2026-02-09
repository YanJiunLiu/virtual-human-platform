import rules
from django.db.models import Model, ForeignKey, ManyToManyField, SET_NULL, CASCADE
from django.db.models import (
    CharField,
    TextField,
    IntegerField,
    BooleanField,
    FloatField
)
from django.conf import settings
from rules.contrib.models import RulesModel
from mgmt.roles import (
    TestResultAdministrator,
    CaseAdministrator,
    CaseWriter,
    CaseViewer,
    StandardizedPatientAdministrator,
    SystemManagementAdministrator
)
# Create your models here.

class MedicalHistory(RulesModel):
    category = CharField(max_length=255)
    created_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, null=True)

    class Meta:
        rules_permissions = {
            "add": SystemManagementAdministrator().has_role(),
            "view": SystemManagementAdministrator().has_role(),
            "list": rules.always_allow,
            "change": SystemManagementAdministrator().has_role(),
            "delete": SystemManagementAdministrator().has_role(),
        }


class Department(RulesModel):
    department_name = CharField(max_length=255)
    medical_history = ManyToManyField(MedicalHistory)
    created_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, null=True)

    class Meta:
        rules_permissions = {
            "add": SystemManagementAdministrator().has_role(),
            "view": SystemManagementAdministrator().has_role(),
            "list": rules.always_allow,
            "change": SystemManagementAdministrator().has_role(),
            "delete": SystemManagementAdministrator().has_role(),
        }

class StandardizedPatient(RulesModel):
    head_shot = TextField(null=True, blank=True)
    last_name=CharField(max_length=255, null=True, blank=True)
    age = IntegerField(null=True, blank=True)
    gender=CharField(max_length=255, null=True, blank=True)
    title=CharField(max_length=255, null=True, blank=True)
    job_title=CharField(max_length=255, null=True, blank=True)
    language = CharField(max_length=255, null=True, blank=True)
    tone = CharField(max_length=255, null=True, blank=True)
    hair_color= CharField(max_length=255, null=True, blank=True)
    hair_styles = CharField(max_length=255, null=True, blank=True)
    complexion=CharField(max_length=255, null=True, blank=True)
    voiceprint=CharField(max_length=255, null=True, blank=True)
    clothing_style=CharField(max_length=255, null=True, blank=True)
    other=CharField(max_length=255, null=True, blank=True)
    status = CharField(max_length=255,choices=[
        ("unused", "unused"),
        ("during_the_exam", "during_the_exam"),
    ])
    created_by=ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, null=True)

    class Meta:
        rules_permissions = {
            "add": StandardizedPatientAdministrator().has_role(),
            "view": StandardizedPatientAdministrator().has_role(),
            "list": StandardizedPatientAdministrator().has_role(),
            "change": StandardizedPatientAdministrator().has_role(),
            "delete": StandardizedPatientAdministrator().has_role(),
        }
###
class Station(Model):
    name = CharField(max_length=255, null=True, blank=True)

class Criteria(Model):
    description=CharField(max_length=255, null=True, blank=True)


class Patient(Model):
    ai_button = BooleanField(default=False)
    name = CharField(max_length=255, null=True, blank=True)

class Therapy(Model):
    text=CharField(max_length=255, null=True, blank=True)

class Diagnosis(Model):
    text=CharField(max_length=255, null=True, blank=True)

class Rect(Model):
    index = CharField(max_length=255, null=True, blank=True)
    x= FloatField(null=True, blank=True)
    y= FloatField(null=True, blank=True)
    width=FloatField(null=True, blank=True)
    height=FloatField(null=True, blank=True)

class CheckData(Model):
    img = TextField(null=True, blank=True)
    rects = ManyToManyField(Rect)
    title = CharField(max_length=255, null=True, blank=True)

class MedicalHistorySetting(Model):
    ai_button = BooleanField(default=False)
    category=CharField(max_length=255, null=True, blank=True)
    description=CharField(max_length=255, null=True, blank=True)
    sentence = CharField(max_length=255, null=True, blank=True)

class MainDescription(Model):
    ai_button = BooleanField(default=False)
    category=CharField(max_length=255, null=True, blank=True)
    description=CharField(max_length=255, null=True, blank=True)
    sentence = CharField(max_length=255, null=True, blank=True)

class Case(RulesModel):
    department=ForeignKey(Department, on_delete=CASCADE, null=True, name="department")
    topic=CharField(max_length=255, null=True, blank=True)
    station = ForeignKey(Station, on_delete=CASCADE, null=True)
    item=CharField(max_length=255, null=True, blank=True)
    criteria = ManyToManyField(Criteria)
    timer_number = CharField(max_length=255, null=True, blank=True)
    timer_unit = CharField(max_length=255, null=True, blank=True)
    guideline_content=TextField(null=True, blank=True)
    standardized_patient=ForeignKey(StandardizedPatient, on_delete=CASCADE, null=True)
    medical_history_settings = ManyToManyField(MedicalHistorySetting)
    main_description=ForeignKey(MainDescription, on_delete=CASCADE, null=True)
    patient=ForeignKey(Patient, on_delete=CASCADE, null=True)
    check_data = ManyToManyField(CheckData)
    DJ_mode = BooleanField(default=False)
    diagnosis_treatment_plan = BooleanField(default=False)
    diagnosis = CharField(max_length=255, null=True, blank=True)
    treatment = CharField(max_length=255, null=True, blank=True)
    created_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, null=True)
    # user-site addition
    complete = BooleanField(default=False)
    current_time = IntegerField(default=0)
    members = ManyToManyField(settings.AUTH_USER_MODEL, related_name="case_members")

    class Meta:
        rules_permissions = {
            "add": CaseAdministrator().has_role() | CaseWriter().has_role(),
            "view": CaseAdministrator().has_role() | CaseViewer().has_role(),
            "list": CaseAdministrator().has_role() | CaseViewer().has_role(),
            "change": CaseAdministrator().has_role() | CaseWriter().has_role(),
            "delete": CaseAdministrator().has_role(),
        }
# TO-DO: Create TestResults table
class TestResults(Model):
    check_data = ManyToManyField(CheckData)
    created_by = ForeignKey(settings.AUTH_USER_MODEL, on_delete=CASCADE, null=True)

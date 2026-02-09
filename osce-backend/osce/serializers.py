from django.db.models import BooleanField
from rest_framework import serializers
from drf_writable_nested.serializers import WritableNestedModelSerializer, NestedCreateMixin, NestedUpdateMixin
from osce.models import (
    MedicalHistory,
    Department,
    StandardizedPatient,
    Case,
    Station,
    Criteria,
    Patient,
    Therapy,
    Diagnosis,
    Rect,
    CheckData,
    MedicalHistorySetting,
    MainDescription,
    TestResults
)

class AutoAddCreatedByNestedModelSerializer(WritableNestedModelSerializer):
    def create(self, validated_data):
        relations, reverse_relations = self._extract_relations(validated_data)

        # Create or update direct relations (foreign key, one-to-one)
        self.update_or_create_direct_relations(
            validated_data,
            relations,
        )

        # Create instance
        validated_data["created_by"] = self.context["request"].user
        instance = super(NestedCreateMixin, self).create(validated_data)

        self.update_or_create_reverse_relations(instance, reverse_relations)

        return instance

    def to_representation(self, instance):
        ret = super(AutoAddCreatedByNestedModelSerializer, self).to_representation(instance)
        if user:=getattr(instance, "created_by"):
            ret["created_by"] = user.account
        return ret

    def update(self, instance, validated_data):
        relations, reverse_relations = self._extract_relations(validated_data)

        # Create or update direct relations (foreign key, one-to-one)
        self.update_or_create_direct_relations(
            validated_data,
            relations,
        )

        # Update instance
        instance = super(NestedUpdateMixin, self).update(
            instance,
            validated_data,
        )
        self.update_or_create_reverse_relations(instance, reverse_relations)
        return instance

class MedicalHistorySerializer(serializers.ModelSerializer):
    category = serializers.CharField(required=True)

    class Meta:
        model = MedicalHistory
        fields = ['category']


class DepartmentSerializer(AutoAddCreatedByNestedModelSerializer):
    medical_history = MedicalHistorySerializer(many=True, write_only=True, required=False)
    department_name = serializers.CharField(required=True)

    class Meta:
        model = Department
        fields = ['medical_history', 'department_name']


class DepartmentListSerializer(AutoAddCreatedByNestedModelSerializer):
    medical_history = MedicalHistorySerializer(many=True, read_only=True)
    department_name = serializers.CharField(read_only=True)

    class Meta:
        model = Department
        fields = '__all__'


class StandardizedPatientSerializer(AutoAddCreatedByNestedModelSerializer):
    # head_shot = serializers.ImageField(required=False, allow_empty_file=True, help_text="Please upload photo file")

    class Meta:
        model = StandardizedPatient
        fields = ["id", "head_shot", "last_name", "age", "gender", "title", "job_title", "tone",
                  "language", "hair_color", "hair_styles", "complexion", "voiceprint", "clothing_style", "other"]

    def to_internal_value(self, data):
        if head_shot := data.get('head_shot'):
            if type(head_shot) != str:
                from base64 import b64encode
                head_shot_base64 = f"data:image/png;base64,{b64encode(head_shot.read()).decode('utf-8')}"
                data["head_shot"] = head_shot_base64
        return super(StandardizedPatientSerializer, self).to_internal_value(data)

class StandardizedPatientSchemaSerializer(serializers.Serializer):
    head_shot = serializers.ImageField(required=False, allow_empty_file=True, help_text="Please upload photo file")
    last_name = serializers.CharField(required=False)
    gender = serializers.CharField(required=False)
    age = serializers.IntegerField(required=False, default=0)
    title = serializers.CharField(required=False)
    job_title = serializers.CharField(required=False)
    language = serializers.CharField(required=False)
    tone = serializers.CharField(required=False)
    hair_color = serializers.CharField(required=False)
    hair_styles = serializers.CharField(required=False)
    complexion = serializers.CharField(required=False)
    voiceprint = serializers.CharField(required=False)
    clothing_style = serializers.CharField(required=False)
    other = serializers.CharField(required=False)
    status = serializers.ChoiceField(choices=(('unused', 'unused'), ('during_the_exam', 'during_the_exam')), default='unused')


class StandardizedPatientListSerializer(AutoAddCreatedByNestedModelSerializer):
    id = serializers.IntegerField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    gender = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)

    class Meta:
        model = StandardizedPatient
        fields = '__all__'


class StationSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False)

    class Meta:
        model = Station
        fields = '__all__'
        read_only_fields = ['id',]

class CriteriaSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False)

    class Meta:
        model = Criteria
        fields = '__all__'
        read_only_fields = ['id',]

class PatientSerializer(serializers.ModelSerializer):
    ai_button = serializers.BooleanField(default=False)
    name = serializers.CharField(required=False)

    class Meta:
        model = Patient
        fields = '__all__'
        read_only_fields = ['id',]

class TherapySerializer(serializers.ModelSerializer):
    text = serializers.CharField(required=False)

    class Meta:
        model = Therapy
        fields = '__all__'
        read_only_fields = ['id',]

class DiagnosisSerializer(serializers.ModelSerializer):
    text = serializers.CharField(required=False)

    class Meta:
        model = Diagnosis
        fields = '__all__'
        read_only_fields = ['id',]


class RectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rect
        fields = '__all__'
        read_only_fields = ['id',]

class CheckDataSerializer(WritableNestedModelSerializer):
    rects = RectSerializer(many=True, required=False)

    class Meta:
        model = CheckData
        fields = '__all__'
        read_only_fields = ['id',]

class MedicalHistorySettingSerializer(WritableNestedModelSerializer):
    class Meta:
        model = MedicalHistorySetting
        fields = '__all__'
        read_only_fields = ['id',]

class MainDescriptionSerializer(WritableNestedModelSerializer):
    class Meta:
        model = MainDescription
        fields = '__all__'
        read_only_fields = ['id', ]

class CaseSerializer(AutoAddCreatedByNestedModelSerializer):
    station = StationSerializer(required=False)
    criteria = CriteriaSerializer(many=True, required=False)
    medical_history_settings = MedicalHistorySettingSerializer(many=True, required=False)
    patient = PatientSerializer(required=False)
    check_data = CheckDataSerializer(many=True, required=False)
    main_description = MainDescriptionSerializer(required=False)

    class Meta:
        model = Case
        fields = '__all__'
        read_only_fields = ["id", "created_by", "members"]

    def to_internal_value(self, data):
        if standardized_patient:= data.get('standardized_patient'):
            if type(standardized_patient) != str:
                if type(standardized_patient) != dict:
                    raise serializers.ValidationError("standardized_patient must be a dict")
                elif standardized_patient_id := standardized_patient.get('id'):
                    data['standardized_patient'] = standardized_patient_id

        if department:= data.get('department'):
            if type(department) != str:
                if type(department) != dict:
                    raise serializers.ValidationError("department must be a dict")
                elif department_id := department.get('id'):
                    data['department'] = department_id

        return super(CaseSerializer, self).to_internal_value(data)

class CaseListSerializer(AutoAddCreatedByNestedModelSerializer):
    department = DepartmentSerializer(read_only=True)
    station = StationSerializer(read_only=True)
    criteria = CriteriaSerializer(many=True, read_only=True)
    medical_history_settings = MedicalHistorySettingSerializer(many=True, read_only=True)
    patient = PatientSerializer(read_only=True)
    check_data = CheckDataSerializer(many=True, read_only=True)
    standardized_patient = StandardizedPatientListSerializer(read_only=True)
    main_description = MainDescriptionSerializer(read_only=True)

    class Meta:
        model = Case
        fields = '__all__'

class CheckDataWithNoImgSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckData
        fields = ["title"]


class DepartmentTestListSerializer(serializers.Serializer):
    id = serializers.CharField(required=False)
    topic = serializers.CharField(required=False)
    department = DepartmentSerializer(read_only=True)
    station = StationSerializer(read_only=True)
    criteria = CriteriaSerializer(many=True, read_only=True)
    medical_history_settings = MedicalHistorySettingSerializer(many=True, read_only=True)
    patient = PatientSerializer(read_only=True)
    check_data = CheckDataWithNoImgSerializer(many=True, read_only=True)
    standardized_patient = StandardizedPatientListSerializer(read_only=True)
    main_description = MainDescriptionSerializer(read_only=True)
    complete = serializers.BooleanField(default=False)
    current_time = serializers.IntegerField(default=0)


class TestResultsSerializer(AutoAddCreatedByNestedModelSerializer):
    check_data = CheckDataSerializer(many=True, required=False)
    class Meta:
        model = TestResults
        fields = '__all__'
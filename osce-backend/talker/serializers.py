from torch.optim.optimizer import required
from django.template.defaultfilters import default
import base64
from rest_framework import serializers
from django.core.files.base import ContentFile
from talker.models import Conversation, ConversationDetail
from drf_writable_nested.serializers import WritableNestedModelSerializer
from osce.serializers import MedicalHistorySettingSerializer

class STTSerializer(serializers.Serializer):
    audio_file = serializers.FileField(required=True)

class MedicalHistory(MedicalHistorySettingSerializer):
    id = serializers.CharField(required=required)
    category = serializers.CharField(required=False)
    description = serializers.CharField(required=False)
    ai_button = serializers.BooleanField(required=False, default=False)
    sentence = serializers.CharField(required=False)

    def to_internal_value(self, data):
        if not data.get('category'):
            del data['category']
        if not data.get('description'):
            del data['description']
        if not data.get('sentence'):
            del data['sentence']
        data = super().to_internal_value(data)
        return data


class Message(serializers.Serializer):
    role = serializers.CharField(required=True)
    content = serializers.CharField(required=True)

class ChatSerializer(serializers.Serializer):
    patient_id = serializers.CharField(required=True)
    message = serializers.CharField(required=False)
    medical_history = MedicalHistory(many=True, required=False, default=[])
    main_description = serializers.CharField(required=False)
    diagnosis = serializers.CharField(required=False)
    treatment = serializers.CharField(required=False)
    history = Message(many=True, required=False, default=[])

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        if data.get('history'):
            formatted_history = []
            for msg in data['history']:
                role = msg.get("role")
                content = msg.get("content")
                formatted_history.append((role, content))
            data['history'] = formatted_history
        return data

class VideoSerializer(serializers.Serializer):
    patient_id = serializers.CharField(required=True)
    image_base64 = serializers.CharField(required=False)
    duration = serializers.IntegerField(required=False, default=10)

    def validate_image_base64(self, value):
        if not value:
            return None
        
        try:
            if ',' in value:
                format, imgstr = value.split(';base64,')
                ext = format.split('/')[-1]  
            else:
                imgstr = value
                ext = 'jpg' 
            
            data = base64.b64decode(imgstr)
            return ContentFile(data, name=f'image.{ext}')
            
        except Exception as e:
            raise serializers.ValidationError(f"Base64 解碼失敗: {str(e)}")

class ConversationSerializer(WritableNestedModelSerializer):
    patient_message = serializers.CharField(required=False)
    user_message = serializers.CharField(required=False)
    timestamp = serializers.DateTimeField(required=True)

    class Meta:
        model = ConversationDetail
        fields = ['patient_message', 'user_message', 'timestamp']
        read_only_fields = ['id']

    def to_internal_value(self, data):
        if not data.get('user_message'):
            del data['user_message']
        if not data.get('patient_message'):
            del data['patient_message']
        data = super().to_internal_value(data)
        return data
        
class SaveConversationSerializer(WritableNestedModelSerializer):
    test_id = serializers.CharField(required=True)
    patient_id = serializers.CharField(required=True)
    conversation = ConversationSerializer(many=True)

    class Meta:
        model = Conversation
        fields = ['test_id', 'patient_id', 'conversation']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ScoringSerializer(serializers.Serializer):
    patient_id = serializers.CharField(required=True)
    medical_history = MedicalHistory(many=True, required=False, default=[])
    main_description = serializers.CharField(required=False)
    diagnosis = serializers.CharField(required=False)
    treatment = serializers.CharField(required=False)
    student_transcript = ConversationSerializer(many=True, required=False, default=[])
    
    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        if data.get('medical_history'):
            for medical_history in data['medical_history']:
                if medical_history.get('id'):
                    del medical_history['id']
                if medical_history.get('ai_button'):
                    del medical_history['ai_button']
                if medical_history.get('sentence'):
                    del medical_history['sentence']
        data['medical_history']  = [obj for obj in data['medical_history'] if "description" in obj and obj["description"]]
        if not data.get('medical_history'):
            del data['medical_history']
        return data
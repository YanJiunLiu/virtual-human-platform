import base64
from rest_framework import serializers
from django.core.files.base import ContentFile
from talker.models import Conversation, ConversationDetail
from drf_writable_nested.serializers import WritableNestedModelSerializer


class STTSerializer(serializers.Serializer):
    audio_file = serializers.FileField(required=True)

class ChatSerializer(serializers.Serializer):
    patient_id = serializers.CharField(required=True)
    message = serializers.CharField(required=False, default="你好,請闡述你的狀況")
    system_content = serializers.CharField(required=False, default="你是一位生了重病的病患,請依照發燒的症狀闡述自己的狀況")


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
        
class SaveConversationSerializer(WritableNestedModelSerializer):
    test_id = serializers.CharField(required=True)
    patient_id = serializers.CharField(required=True)
    conversation = ConversationSerializer(many=True)

    class Meta:
        model = Conversation
        fields = ['test_id', 'patient_id', 'conversation']
        read_only_fields = ['id', 'created_at', 'updated_at']
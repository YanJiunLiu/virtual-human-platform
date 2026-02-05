import base64
from rest_framework import serializers
from django.core.files.base import ContentFile

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
        
        if ',' in value:
            header, imgstr = value.split(',', 1)
            ext = header.split('/')[-1].split(';')[0] if 'image/' in header else 'jpg'
        else:
            imgstr = value
            ext = 'jpg'
        
        try:
            data = base64.b64decode(imgstr)
            return ContentFile(data, name=f'upload.{ext}')
        except Exception as e:
            raise serializers.ValidationError(f"Base64 decode error: {str(e)}")


   
    
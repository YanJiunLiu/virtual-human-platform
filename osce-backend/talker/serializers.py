from rest_framework import serializers

class ChatSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000)    

class AudioSerializer(serializers.Serializer):
    patient_id = serializers.CharField(required=True)
    audio_file = serializers.FileField(required=True)
    system_content = serializers.CharField(required=False, default="你是一位生了重病的病患,請依照發燒的症狀闡述自己的狀況")

class WebRTCSerializer(serializers.Serializer):
    sdp = serializers.CharField(help_text="前端生成的 Offer SDP 字串")
    type = serializers.ChoiceField(choices=["offer", "answer"], default="offer")

class VideoSerializer(serializers.Serializer):
    patient_id = serializers.CharField(required=True)
    image_base64 = serializers.CharField(required=True, allow_null=True)
    duration = serializers.IntegerField(required=False, allow_null=True)

    def validate_image_base64(self, value):
        if not value:
            return None
        
        import base64
        from django.core.files.base import ContentFile
        
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
    
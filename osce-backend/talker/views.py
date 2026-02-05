from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import action
from langchain_core.messages import HumanMessage
from drf_spectacular.views import (
    get_relative_url, 
    set_query_parameters, 
    reverse, 
    SpectacularAPIView, 
    SpectacularSwaggerView
)
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view
)

from talker.serializers import (
    ChatSerializer,
    AudioSerializer,
    VideoSerializer
)
from talker.decorators import talker


# Create your views here.
@extend_schema(tags=["對話"])
@extend_schema_view(
    create=extend_schema(
        description="Chat with LLM.",
        request=AudioSerializer,
        responses={201: {"type": "string"}},
    ),
    ask=extend_schema(
        description="Ask LLM.",
        request=ChatSerializer,
        responses={201: {"type": "string"}},
        exclude=True
    ),
    stt=extend_schema(
        description="STT with LLM.",
        request=AudioSerializer,
        responses={201: {"type": "string"}},
        exclude=True
    ),
    idle_video=extend_schema(
        description="Idle video.",
        request=VideoSerializer,
        responses={201: {"type": "string"}}
    ),
    add_video_to_streamer=extend_schema(
        description="Add video to streamer.",
        request=AudioSerializer,
        responses={201: {"type": "string"}}
    )
)
class ChatViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = AudioSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @talker()
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        audio_obj = serializer.validated_data['audio_file']
        system_content = serializer.validated_data['system_content']
        patient_id = serializer.validated_data['patient_id']
        text = request.system.stt(audio_obj)
        clean_text = request.system.clean_text_content(text)
        request.system.chat_ollama(
            text=clean_text, 
            system_content=system_content,
            patient_id=patient_id
        ) 
        return Response({
            "success": True,    
            "data": {
                "message": "開始插播影片"
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=["post"], serializer_class=ChatSerializer)
    def ask(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        chat = ChatOllama(
            base_url="http://192.168.0.46:11444/",
            model="alibayram/medgemma",
        )
        
        response = chat.invoke([HumanMessage(content=serializer.validated_data["message"])])
        
        return Response(response.content)

    @talker()
    @action(detail=False, methods=["post"], serializer_class=AudioSerializer)
    def stt(self, request, *args, **kwargs):
        serializer = AudioSerializer(data=request.data)
        
        if serializer.is_valid():
            audio_obj = serializer.validated_data['audio_file']
            text = request.system.stt(audio_obj)
            return Response({
                "success": True, 
                "data": {
                    "file_name": audio_obj.name,
                    "content_type": audio_obj.content_type,
                    "text": text
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            "success": False, 
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @talker()
    @action(detail=False, methods=["post"], serializer_class=VideoSerializer)
    def idle_video(self, request, *args, **kwargs):
        serializer = VideoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image_base64 = serializer.validated_data.get("image_base64")
        patient_id = serializer.validated_data.get("patient_id")
        duration = serializer.validated_data.get("duration")
        relative_path=request.system.is_idle_video_exist(patient_id, duration)
        if not relative_path:
            image_path = request.system.save_base64_image(
                base64_obj=image_base64, 
                patient_id=patient_id
            )
            relative_path = request.system.generate_video(
                image_path=image_path, 
                duration=duration,
                use_idle_mode=True,
                patient_id=patient_id
            )
        full_url = request.build_absolute_uri('/'+relative_path)
        return Response({
            "success": True,    
            "data": {
                "video_url": full_url
            }
        }, status=status.HTTP_200_OK)
    
    @talker()
    @action(detail=False, methods=["post"], serializer_class=AudioSerializer)
    def add_video_to_streamer(self, request, *args, **kwargs):
        request.system.add_video_to_streamer(
            video_path="/Users/yanjiunliu/Workspace/itri/osce-csmu/osce-backend/media/videos/923c97b1-1525-4c00-bdcc-51a01d411988/1_audio_1769821832584_full.mp4"
        )
        return Response({
            "success": True,    
            "data": {
                "message": "開始插播影片"
            }
        }, status=status.HTTP_200_OK)
    
@extend_schema(exclude=True)
class  TalkerSpectacularAPIView(SpectacularAPIView):
    """
        OpenApi3 schema for this API. Format can be selected via content negotiation.

        - YAML: application/vnd.oai.openapi
        - JSON: application/vnd.oai.openapi+json
    """

class TalkerSpectacularSwaggerView(SpectacularSwaggerView):
    def _get_schema_url(self, request):
        schema_url = self.url or get_relative_url(reverse(f"talker:{self.url_name}", request=request))
        return set_query_parameters(
            url=schema_url,
            lang=request.GET.get('lang'),
            version=request.GET.get('version')
        )
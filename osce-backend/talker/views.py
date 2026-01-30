from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.decorators import action
from langchain_community.chat_models import ChatOllama
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
    WebRTCSerializer,
    VideoSerializer
)
from talker.decorators import talker, atalker
from asgiref.sync import async_to_sync
from rest_framework.permissions import AllowAny
# Create your views here.
@extend_schema(tags=["對話"])
@extend_schema_view(
    create=extend_schema(
        description="Chat with LLM.",
        request=ChatSerializer,
        responses={201: {"type": "string"}},
    ),
    stt=extend_schema(
        description="STT with LLM.",
        request=AudioSerializer,
        responses={201: {"type": "string"}},
    )
)
class ChatViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = ChatSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
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
            text = request.system.transcribe(audio_obj)
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
        
        image_path = request.system.save_base64_image(image_base64, f"{patient_id}.jpg")
        relative_path = request.system.generate_idle_video(image_path, duration)
        full_url = request.build_absolute_uri(relative_path)
        return Response({
            "success": True,    
            "data": {
                "video_url": full_url
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
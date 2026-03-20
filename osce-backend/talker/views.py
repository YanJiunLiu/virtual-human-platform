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
    ScoringSerializer,
    SaveScoringSerializer,
    STTSerializer,
    VideoSerializer,
    SaveConversationSerializer,
    Conversation,
)
from talker.decorators import talker
from osce.models import StandardizedPatient


# Create your views here.
@extend_schema(tags=["對話"])
@extend_schema_view(
    ollama=extend_schema(
        description="Chat with Ollama.",
        request=ChatSerializer,
        responses={201: {"type": "string"}},
    ),
    stt=extend_schema(
        description="STT with LLM.",
        request=STTSerializer,
        responses={201: {"type": "string"}}
    ),
    idle_video=extend_schema(
        description="Idle video with LLM.",
        request=VideoSerializer,
        responses={201: {"type": "string"}}
    )
)
class ChatViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = STTSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @talker()
    @action(detail=False, methods=["post"], serializer_class=ChatSerializer)
    def ollama(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient_id = serializer.validated_data['patient_id']
        # 先取得病患圖片路徑
        absolute_image_path = request.system.get_image_path(
            patient_id=patient_id
        )

        patient = StandardizedPatient.objects.get(id=patient_id)
        name = f"{patient.last_name}{patient.title}"
        age = patient.age
        gender = patient.gender
        occupation = patient.job_title

        medical_history = serializer.validated_data.get('medical_history', [])
        main_description = serializer.validated_data.get('main_description', [])
        diagnosis = serializer.validated_data.get('diagnosis', [])
        treatment = serializer.validated_data.get('treatment', [])
        history = serializer.validated_data.get('history', [])
        message = serializer.validated_data['message']

        clean_text = request.system.clean_text_content(message)
        history.append(("human", clean_text))
         
        data = {
                "name": name,
                "age": age,
                "gender": gender,
                "occupation": occupation,
                "medical_history": medical_history,
                "main_description": main_description,
                "diagnosis": diagnosis,
                "treatment": treatment
            }
        response = request.system.chat_ollama(
            data = data,
            history = history
        ) 
        response_text =request.system.create_audio_and_video(
            response=response,
            absolute_image_path=absolute_image_path,
            patient_id=patient_id
        )
        
        return Response({
            "success": True,    
            "data": {
                "text": response_text
            }
        }, status=status.HTTP_200_OK)

    @talker()
    @action(detail=False, methods=["post"], serializer_class=ScoringSerializer)
    def scoring(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        medical_history = serializer.validated_data.get('medical_history', [])
        main_description = serializer.validated_data.get('main_description', [])
        diagnosis = serializer.validated_data.get('diagnosis', [])
        treatment = serializer.validated_data.get('treatment', [])
        student_transcript = serializer.validated_data.get('student_transcript', [])
        data = {
                "medical_history": medical_history,
                "main_description": main_description,
                "diagnosis": diagnosis,
                "treatment": treatment,
                "student_transcript": student_transcript
            }
        response_text = request.system.chat_ollama(
            data = data,
            scoring = True
        )
        rep = {"score": response_text}
        serializer = SaveScoringSerializer(data=rep)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,    
            "data": rep
        }, status=status.HTTP_200_OK)

    @talker()
    @action(detail=False, methods=["post"], serializer_class=ChatSerializer)
    def stt(self, request, *args, **kwargs):
        serializer = STTSerializer(data=request.data)
        
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
                contentFile=image_base64,
                patient_id=patient_id
            )
            print("image_path", image_path)
            relative_path = request.system.generate_video(
                image_path=image_path, 
                duration=duration,
                use_idle_mode=True,
                patient_id=patient_id
            )
            print("relative_path", relative_path)
        full_url = request.build_absolute_uri('/'+relative_path)
        print("full_url", full_url)
        return Response({
            "success": True,    
            "data": {
                "video_url": full_url
            }
        }, status=status.HTTP_200_OK)
    
    @talker()
    @action(detail=False, methods=["post"], serializer_class=SaveConversationSerializer, parser_classes=[JSONParser])
    def save_conversation(self, request, *args, **kwargs):
        serializer = SaveConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,    
            "data": {
            "conversation": serializer.data
        }
        }, status=status.HTTP_200_OK)
 
    
    @action(detail=True, methods=["get"], serializer_class=SaveConversationSerializer)
    def get_conversation(self, request, *args, **kwargs):
        conversation = Conversation.objects.get(id=kwargs["pk"])
        serializer = SaveConversationSerializer(conversation)
        return Response({
            "success": True,    
            "data": {
                "conversation": serializer.data
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
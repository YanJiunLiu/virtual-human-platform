from pooch import retrieve
from torch import embedding
import asyncio
import os
import sys
import time
import base64
import re
from yarl import URL
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.conf.urls.static import static
from faster_whisper import WhisperModel
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_chroma import Chroma
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document
# from langchain.memory import ConversationBufferMemory
from backend_api.connection_manager import video_stream_manager, audio_stream_manager
from asgiref.sync import async_to_sync
from datetime import datetime

class BaseSystem:
    def __init__(self,request):
        self.request = request
        self.user = request.user

    @staticmethod
    def load_markdown(markdown_path):
        print("markdown_path: ", markdown_path)
        with open(markdown_path, 'r', encoding='utf-8') as f:
            return f.read()

class CSMUSystem(BaseSystem):

    def get_image_url(self, image_obj, sub_dir):

        if image_obj:
            abs_url = URL(self.request.build_absolute_uri(image_obj))
            return str(URL(f"{abs_url.scheme}://{abs_url.host}:{abs_url.port}{settings.MEDIA_URL}{sub_dir}/{abs_url.name}"))
        return None

class WhisperSystem(BaseSystem):
    model: WhisperModel | None = None
    
    @classmethod
    def load_model(cls)->WhisperModel:
        """
        Load the Whisper model.
        """
        if cls.model is None:
            cls.model = WhisperModel(
                model_size_or_path = settings.WHISPER_MODEL_PATH, 
                device="auto", 
                compute_type="default",
                local_files_only=True
            )
        return cls.model

    def stt(self, audio_file):
        model = WhisperSystem.load_model()
        segments, info = model.transcribe(audio_file, beam_size=5,vad_filter=True)
        combined_text = "".join(segment.text for segment in segments).strip()
        return combined_text

    @staticmethod
    def parse_number(value):
        if value is None:
            return 0
        value = str(value).strip()
        value = value.replace('%', '').replace('Hz', '')
        try:
            return int(value)
        except:
            return 0

    @staticmethod
    def generate_audio_patient_path(patient_id):
        timestamp = int(time.time() * 1000)
        date_str = datetime.now().strftime('%Y_%m_%d')
        output_audio_dir = os.path.join(settings.AUDIO_DIR, date_str, patient_id)
        os.makedirs(output_audio_dir, exist_ok=True)
        output_audio_path = os.path.join(output_audio_dir, f'audio_{timestamp}.wav')
        return output_audio_path

    def tts(self, text, patient_id='Unknown'):
        output_audio_path = self.generate_audio_patient_path(patient_id)
        linly_path = os.path.join(settings.BASE_DIR, 'backend_api/linly_talker')
        original_cwd = os.getcwd()
        os.chdir(linly_path)
        if linly_path not in sys.path:
            sys.path.insert(0, linly_path)
        from TTS import EdgeTTS
        edge_tts = EdgeTTS()
        tts_params = {
            'voice': 'zh-CN-XiaoxiaoNeural',
            'rate': '+0%',
            'volume': '+50%',
            'pitch': '+0Hz',
        }
        edge_tts.predict(
                TEXT=text,
                VOICE=tts_params.get('voice'),
                RATE=self.parse_number(tts_params.get('rate')),
                VOLUME=self.parse_number(tts_params.get('volume')),
                PITCH=self.parse_number(tts_params.get('pitch')),
                OUTPUT_FILE=output_audio_path,
                OUTPUT_SUBS=None
            )
        os.chdir(original_cwd)
        relative_path = os.path.relpath(output_audio_path, settings.MEDIA_DIR)
        audio_url = os.path.join(settings.MEDIA_URL, relative_path)
        return audio_url
    
    @staticmethod
    def silent_audio_path():
        timestamp = int(time.time() * 1000)
        silent_audio_path = os.path.join(settings.AUDIO_DIR, f'silent_{timestamp}.wav')
        return silent_audio_path

    def generate_video(self, image_path, duration=0, audio_path=None, use_idle_mode=False, patient_id=None):
        linly_path = os.path.join(settings.BASE_DIR, 'backend_api/linly_talker')
        original_cwd = os.getcwd()
        os.chdir(linly_path)
        if linly_path not in sys.path:
            sys.path.insert(0, linly_path)
        from TFG import SadTalker
        sad_talker = SadTalker(
            checkpoint_path='checkpoints',
            config_path='src/config',
            lazy_load=True
        )
        if use_idle_mode:
            audio_path = None
            result_dir = os.path.join(settings.MEDIA_DIR, 'idle_videos')
        else:
            result_dir = os.path.join(settings.MEDIA_DIR, 'videos')

        video_path = sad_talker.execute(
            source_image=image_path,
            driven_audio=audio_path,
            preprocess='full',
            still_mode=False,
            use_enhancer=False,
            batch_size=2,
            size=256,
            pose_style=0,
            facerender='facevid2vid',
            exp_scale=1.0,
            use_ref_video=False,
            ref_video=None,
            ref_info=None,
            use_idle_mode=use_idle_mode,
            length_of_audio=duration,
            use_blink=True,
            result_dir=result_dir,
            result_dir_tag=patient_id
        )
        
        os.chdir(original_cwd)
        relative_path = os.path.relpath(video_path, settings.OUTPUT_ROOT_DIR)
        return relative_path

    @staticmethod
    def get_image_path(patient_id):
        extensions = [".jpg", ".jpeg", ".png", ".webp", ".bmp"]
        for ext in extensions:
            file_path = os.path.join(settings.PICTURE_DIR, f"{patient_id}{ext}")
            if os.path.exists(file_path):
                return file_path
        
        assert False, "Please run idle_video first"


    def save_base64_image(self, contentFile, patient_id):
        file_name = contentFile.name.replace("image", patient_id)
        file_path = os.path.join(settings.PICTURE_DIR, file_name)
        if not os.path.exists(file_path):
            custom_storage = FileSystemStorage(location=settings.PICTURE_DIR)
            custom_storage.save(file_name, contentFile)
        return file_path


       

    def build_absolute_output_path(self, relative_output_path):
        clean_relative_path = relative_output_path.lstrip('/')
        return os.path.join(settings.OUTPUT_ROOT_DIR, clean_relative_path)
    
    @staticmethod
    def is_punct_re(char):
        return bool(re.match(r'[^\w\s]', char)) 

    def _chat_ollama(self, text, system_content:list):
        rules = self.load_markdown(f"{settings.MARKDOWN_DIR}/Rule.md")

        llm = ChatOpenAI(
            api_key="ollama",
            base_url=settings.OLLAMA_V1_URL,
            model=settings.OLLAMA_MODEL,
            temperature=0.9
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", "請嚴格遵守以下規範：\n{rules}"),
            ("system", "以下是你當前檢索到的病歷資訊：\n{context}"),
            ("human", "{input}"),
        ])
        chain = prompt | llm.bind(
            stop=["。", "\n", "！"], 
            max_tokens=20
        )
        response = chain.invoke({"input": text, "rules":rules, "context":system_content})
        return response

    def chat_ollama(self, text, patient_id='Unknown', system_content="你是一位病患"):
        absolute_image_path = self.get_image_path(
            patient_id=patient_id
        )
        response = self._chat_ollama( 
            text=text, 
            system_content=system_content,
        )
        clean_response = self.clean_text_content(response.content)
        relative_audio_path = self.tts(
            text=clean_response, 
            patient_id=patient_id
        )
        absolute_audio_path = self.build_absolute_output_path(
            relative_output_path = relative_audio_path
        )
        relative_media_path = self.generate_video(
            image_path=absolute_image_path,
            audio_path=absolute_audio_path,
        )
        absolute_media_path = self.build_absolute_output_path(
            relative_output_path = relative_media_path
        )
        self.add_video_and_audio_to_streamer(
            video_path=absolute_media_path,
            audio_path=absolute_audio_path,
            patient_id=patient_id
        )
        return clean_response

    @staticmethod
    def clean_text_content(text: str) -> str:
        text = re.sub(r'\*+', '', text)
        text = re.sub(r'#+\s*', '', text)
        text = re.sub(r'`+', '', text)
        text = re.sub(r'~+', '', text)
        text = re.sub(r'_+', '', text)
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'[<>{}]', '', text)
        text = re.sub(r'^\s*[-•]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        return text

    def add_video_and_audio_to_streamer(self, video_path, audio_path, patient_id='1'):
        current_video_track = video_stream_manager.get_track(patient_id)
        async_to_sync(current_video_track.add_video_to_streamer)(video_path)
        current_audio_track = audio_stream_manager.get_track(patient_id)
        async_to_sync(current_audio_track.add_audio_to_streamer)(audio_path)

    def is_idle_video_exist(self, patient_id: str, duration: int)->str:
        idle_video_path = os.path.join(settings.MEDIA_DIR, 'idle_videos', patient_id, f"{patient_id}_idlemode_{duration}_full.mp4")
        if os.path.exists(idle_video_path):
            relative_path = os.path.relpath(idle_video_path, settings.OUTPUT_ROOT_DIR)
            return relative_path
        else:
            return None
        
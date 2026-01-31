import asyncio
import os
import sys
import time
import base64
import re
from yarl import URL
from django.conf import settings
from django.conf.urls.static import static
from faster_whisper import WhisperModel
from langchain_ollama.chat_models import ChatOllama
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from backend_api.connection_manager import stream_manager
from asgiref.sync import async_to_sync

class BaseSystem:
    def __init__(self,request):
        self.request = request
        self.user = request.user

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

    def tts(self, text):
        timestamp = int(time.time() * 1000)
        output_audio_path = os.path.join(settings.AUDIO_DIR, f'audio_{timestamp}.wav')
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

    def generate_video(self, image_path, duration=0, audio_path=None, use_idle_mode=False):
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
            result_dir=result_dir
        )
        
        os.chdir(original_cwd)
        relative_path = os.path.relpath(video_path, settings.OUTPUT_ROOT_DIR)
        return relative_path

    @staticmethod
    def image_name(patient_id):
        return f"{patient_id}.jpg"

    def save_base64_image(self, base64_obj, patient_id):
        try:
            base64_obj.seek(0)
            raw_content = base64_obj.read()

            if raw_content.startswith(b'\x89PNG') or raw_content.startswith(b'\xff\xd8'):
                img_data = raw_content
            else:
                try:
                    base64_str = raw_content.decode('utf-8')
                    if "," in base64_str:
                        base64_str = base64_str.split(",")[1]
                    img_data = base64.b64decode(base64_str)
                except (UnicodeDecodeError, ValueError):
                    img_data = raw_content

            if not os.path.exists(settings.PICTURE_DIR):
                os.makedirs(settings.PICTURE_DIR, exist_ok=True)

            file_path = os.path.join(settings.PICTURE_DIR, self.image_name(patient_id))
            with open(file_path, "wb") as f:
                f.write(img_data)
        
            return file_path

        except Exception as e:
            print(f"儲存圖片失敗: {str(e)}")
            return None

    def get_image_path(self, patient_id):
        return os.path.join(settings.PICTURE_DIR, self.image_name(patient_id))

    def build_absolute_output_path(self, relative_output_path):
        clean_relative_path = relative_output_path.lstrip('/')
        return os.path.join(settings.OUTPUT_ROOT_DIR, clean_relative_path)

    def chat_ollama(self, text, system_content="你是一位病患"):
        llm = ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
        )
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_content),
            ("human", "{input}"),
        ])
        chain = prompt | llm
        response = chain.invoke({"input": text})
        return response.content

    def clean_text_content(self, text: str) -> str:
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

    def add_video_to_streamer(self, video_path, patient_id='1'):
        current_track = stream_manager.get_track(patient_id)
        async_to_sync(current_track.add_video_to_streamer)(video_path)

    def is_idle_video_exist(self, patient_id: str, duration: int)->str:
        idle_video_path = os.path.join(settings.MEDIA_DIR, 'idle_videos', patient_id, f"{patient_id}_idlemode_{duration}_full.mp4")
        if os.path.exists(idle_video_path):
            relative_path = os.path.relpath(idle_video_path, settings.OUTPUT_ROOT_DIR)
            return relative_path
        else:
            return None
        
import asyncio
import os
import sys
import time
import base64
from yarl import URL
from django.conf import settings
from django.conf.urls.static import static
from faster_whisper import WhisperModel


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

    def transcribe(self, audio_file):
        model = WhisperSystem.load_model()
        segments, info = model.transcribe(audio_file, beam_size=5,vad_filter=True)
        combined_text = "".join(segment.text for segment in segments).strip()
        return combined_text


    def generate_idle_video(self, image_path, duration):
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
        
        timestamp = int(time.time() * 1000)
        silent_audio_path = os.path.join(settings.MEDIA_DIR, f'silent_{timestamp}.wav')
        
        video_path = sad_talker.execute(
            source_image=image_path,
            driven_audio=silent_audio_path,
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
            use_idle_mode=True,
            length_of_audio=duration,
            use_blink=True,
            result_dir=os.path.join(settings.MEDIA_DIR, 'idle_videos')
        )
        
        if os.path.exists(silent_audio_path):
            os.remove(silent_audio_path)
        
        os.chdir(original_cwd)
        relative_path = os.path.relpath(video_path, settings.MEDIA_ROOT)
        media_url = os.path.join(settings.MEDIA_URL, relative_path)
        return media_url
            
    def save_base64_image(self, base64_obj, filename):
        try:
            base64_obj.seek(0)
            raw_content = base64_obj.read()
        
            # 檢查是否為原始二進位圖片 (PNG 開頭通常是 b'\x89PNG')
            # 如果是二進位，直接寫入檔案即可
            if raw_content.startswith(b'\x89PNG') or raw_content.startswith(b'\xff\xd8'):
                img_data = raw_content
            else:
                # 如果不是二進位，才嘗試當作字串處理
                try:
                    base64_str = raw_content.decode('utf-8')
                    if "," in base64_str:
                        base64_str = base64_str.split(",")[1]
                    img_data = base64.b64decode(base64_str)
                except (UnicodeDecodeError, ValueError):
                    # 如果連 decode 都失敗，那可能就是原始資料
                    img_data = raw_content

            # 儲存
            if not os.path.exists(settings.PICTURE_DIR):
                os.makedirs(settings.PICTURE_DIR, exist_ok=True)

            file_path = os.path.join(settings.PICTURE_DIR, filename)
            with open(file_path, "wb") as f:
                f.write(img_data)
        
            return file_path

        except Exception as e:
            print(f"儲存圖片失敗: {str(e)}")
            return None




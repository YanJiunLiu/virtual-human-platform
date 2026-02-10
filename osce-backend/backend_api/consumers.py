import json
import os
import traceback
from urllib.parse import parse_qs

from django.conf import settings
from channels.generic.websocket import AsyncWebsocketConsumer
from aiortc import (
    RTCPeerConnection, 
    RTCSessionDescription, 
    RTCIceServer, 
    RTCConfiguration, 
    RTCRtpReceiver
)
from backend_api.streamer import VideoLoopTrack, AudioLoopTrack
from backend_api.connection_manager import video_stream_manager, audio_stream_manager

class WebRTCConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope['query_string'].decode()
        params = parse_qs(query_string)
        self.patient_id = params.get('patient_id', [None])[0]
        self.duration = params.get('duration', [None])[0]
        
        DOCKER_COTURN_IP = getattr(settings, 'DOCKER_COTURN_IP', '172.18.0.2')
        HOST_OUTER_IP = getattr(settings, 'HOST_OUTER_IP', '118.163.52.147')
        TURN_INNER_PORT = getattr(settings, 'TURN_INNER_PORT', '3478')
        TURN_OUTER_PORT = getattr(settings, 'TURN_OUTER_PORT', '12004')
        
        TURN_USERNAME = getattr(settings, 'TURN_USERNAME', 'osce')
        TURN_CREDENTIAL = getattr(settings, 'TURN_CREDENTIAL', 'osce')
        await self.accept()
        
        ice_servers = [
            # 1. 容器內部直連 (解決後端在容器內連不到公網 IP 的問題)
            RTCIceServer(
                urls=[f"turn:{DOCKER_COTURN_IP}:{TURN_INNER_PORT}"], 
                username=TURN_USERNAME,
                credential=TURN_CREDENTIAL
            ),
            # 2. 公網連線 (給前端外網使用的)
            RTCIceServer(
                urls=[f"turn:{HOST_OUTER_IP}:{TURN_OUTER_PORT}"],
                username=TURN_USERNAME,
                credential=TURN_CREDENTIAL
            ),
            # 3. 加密公網連線
            RTCIceServer(
                urls=[f"turns:{HOST_OUTER_IP}:{TURN_OUTER_PORT}"],
                username=TURN_USERNAME,
                credential=TURN_CREDENTIAL
            )
        ]   
        config = RTCConfiguration(iceServers=ice_servers)
        self.pc = RTCPeerConnection(configuration=config)
        
        @self.pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            print(f"WebRTC 狀態變更: {self.pc.iceConnectionState}")
            if self.pc.iceConnectionState == "failed":
                await self.pc.close()

        print(f"WebSocket 已連線 (Patient: {self.patient_id})，已配置 TURN Server")

    async def disconnect(self, close_code):
        if hasattr(self, 'pc'):
            await self.pc.close()
            print("WebRTC 連線已關閉")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            
            if message_type == "offer":
                idle_video_path = os.path.join(
                    settings.MEDIA_DIR, "idle_videos", self.patient_id, 
                    f"{self.patient_id}_idlemode_{self.duration}_full.mp4"
                )
                # idle_video_path = "/Users/yanjiunliu/Workspace/itri/osce-csmu/osce-backend/media/videos/17be6eb5-6122-4ed8-8618-12f26444d25d/1_audio_1770274842821_full.mp4"
                idle_audio_path = os.path.join(
                    settings.MEDIA_DIR, "idle_videos", self.patient_id,
                    "input",f"idlemode_{self.duration}.wav" 
                )   
                # idle_audio_path = "/Users/yanjiunliu/Workspace/itri/osce-csmu/osce-backend/media/audios/2026_02_05/1/audio_1770274842821.wav"
                
                if not os.path.exists(idle_video_path):
                    print(f"找不到影片: {idle_video_path}")
                    return
                if not os.path.exists(idle_audio_path):
                    print(f"找不到音訊: {idle_audio_path}")
                    return

                offer = RTCSessionDescription(sdp=data["sdp"], type="offer")
                await self.pc.setRemoteDescription(offer)

                video_track = VideoLoopTrack(idle_video_path)
                audio_track = AudioLoopTrack(idle_audio_path)
                
                for transceiver in self.pc.getTransceivers():
                    if transceiver.kind == "video":
                        transceiver.sender.replaceTrack(video_track)
                        transceiver.direction = "sendonly"
                    elif transceiver.kind == "audio":
                        transceiver.sender.replaceTrack(audio_track)
                        transceiver.direction = "sendonly"

                video_stream_manager.register_track(self.patient_id, video_track)
                audio_stream_manager.register_track(self.patient_id, audio_track)
                
                answer = await self.pc.createAnswer()
                await self.pc.setLocalDescription(answer)
                
                # 取得原始 SDP
                original_sdp = self.pc.localDescription.sdp
                print("original_sdp", original_sdp)
                # 將容器內網 IP 強制替換成你的「公網 IP」
                # 這樣前端瀏覽器才知道要透過公網去連線，進而觸發 TURN 中繼
                modified_sdp = original_sdp.replace("172.18.0.3", "118.163.52.174")
                print("modified_sdp", modified_sdp)

                await self.send(text_data=json.dumps({
                    "type": "answer",
                    "sdp": modified_sdp
                }))

        except Exception as e:
            print(f"Receive Error: {e}")
            traceback.print_exc()
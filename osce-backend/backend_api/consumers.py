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
        
        self.external_ip = getattr(settings, 'EXTERNAL_IP', '192.168.0.46')
        self.turn_port = getattr(settings, 'TURN_PORT', '3478')
        self.turn_username = getattr(settings, 'TURN_USERNAME', 'osce')
        self.turn_credential = getattr(settings, 'TURN_CREDENTIAL', 'osce')
        await self.accept()
        
        ice_servers = [
            RTCIceServer(
                urls=[f"turns:{self.external_ip}:{self.turn_port}"],
                username=self.turn_username,
                credential=self.turn_credential
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
                
                await self.send(text_data=json.dumps({
                    "type": "answer",
                    "sdp": self.pc.localDescription.sdp
                }))

        except Exception as e:
            print(f"Receive Error: {e}")
            traceback.print_exc()
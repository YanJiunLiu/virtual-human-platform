import json
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from aiortc import RTCPeerConnection, RTCSessionDescription
from backend_api.streamer import VideoLoopTrack
from backend_api.connection_manager import stream_manager
from urllib.parse import parse_qs
from django.conf import settings


class WebRTCConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope['query_string'].decode()
        params = parse_qs(query_string)
        self.patient_id = params.get('patient_id', [None])[0]
        self.duration = params.get('duration', [None])[0]

        await self.accept()
        self.pc = RTCPeerConnection()
        idle_vedio_path = os.path.join(
            settings.MEDIA_DIR, 
            "idle_videos", 
            self.patient_id, 
            f"{self.patient_id}_idlemode_{self.duration}_full.mp4"
        )
        video_track = VideoLoopTrack(idle_vedio_path)
        self.pc.addTrack(video_track)
        stream_manager.register_track(self.patient_id, video_track)

    async def disconnect(self, close_code):
        await self.pc.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if data["type"] == "offer":
            offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
            await self.pc.setRemoteDescription(offer)
            
            answer = await self.pc.createAnswer()
            await self.pc.setLocalDescription(answer)
            
            await self.send(text_data=json.dumps({
                "type": self.pc.localDescription.type,
                "sdp": self.pc.localDescription.sdp
            }))
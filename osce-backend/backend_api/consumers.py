import json
from channels.generic.websocket import AsyncWebsocketConsumer
from aiortc import RTCPeerConnection, RTCSessionDescription
from backend_api.streamer import VideoLoopTrack
from backend_api.connection_manager import stream_manager

class WebRTCConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.pc = RTCPeerConnection()
        
        video_track = VideoLoopTrack("/Users/yanjiunliu/Workspace/itri/osce-csmu/osce-backend/media/idle_videos/1/1_idlemode_10.mp4")
        self.pc.addTrack(video_track)
        stream_manager.register_track('1', video_track)

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
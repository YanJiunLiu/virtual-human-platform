import json
from channels.generic.websocket import AsyncWebsocketConsumer
from aiortc import RTCPeerConnection, RTCSessionDescription
from backend_api.streamer import VideoLoopTrack  # 導入我們步驟三寫的類別

class WebRTCConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # 建立一個 WebRTC 連線實例
        self.pc = RTCPeerConnection()
        
        # 把你的 10 秒影片路徑放這裡
        video_track = VideoLoopTrack("/Users/yanjiunliu/Workspace/itri/osce-csmu/osce-backend/media/idle_videos/1/1_idlemode_10.mp4")
        self.pc.addTrack(video_track)

    async def disconnect(self, close_code):
        await self.pc.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        # 當前端傳來 offer (連線請求)
        if data["type"] == "offer":
            offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
            await self.pc.setRemoteDescription(offer)
            
            # 產生後端的 answer (回應)
            answer = await self.pc.createAnswer()
            await self.pc.setLocalDescription(answer)
            
            # 把回應傳回給前端
            await self.send(text_data=json.dumps({
                "type": self.pc.localDescription.type,
                "sdp": self.pc.localDescription.sdp
            }))
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
from backend_api.streamer import VideoLoopTrack

class WebRTCConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope['query_string'].decode()
        params = parse_qs(query_string)
        self.patient_id = params.get('patient_id', [None])[0]
        self.duration = params.get('duration', [None])[0]
        
        # 取得設定的外部 IP
        self.external_ip = getattr(settings, 'EXTERNAL_IP', '192.168.0.132')

        await self.accept()

        # --- 關鍵修正：配置 ICE Server ---
        # 讓 aiortc 知道要去哪裡進行 TURN 轉發，這樣它會自動生成正確的 Relay Candidate
        ice_servers = [
            RTCIceServer(
                urls=[f"turn:{self.external_ip}:3478"],
                username="osce",
                credential="osce"
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
                # 1. 檢查影片檔案
                idle_video_path = os.path.join(
                    settings.MEDIA_DIR, "idle_videos", self.patient_id, 
                    f"{self.patient_id}_idlemode_{self.duration}_full.mp4"
                )
                
                if not os.path.exists(idle_video_path):
                    print(f"找不到影片: {idle_video_path}")
                    return

                # 準備軌道
                video_track = VideoLoopTrack(idle_video_path)
                self.pc.addTrack(video_track)

                # 2. 處理遠端 Offer
                offer = RTCSessionDescription(sdp=data["sdp"], type="offer")
                await self.pc.setRemoteDescription(offer)
                
                # 3. 設定 Transceiver (鎖定 VP8)
                for transceiver in self.pc.getTransceivers():
                    if transceiver.kind == "video":
                        transceiver.direction = "sendonly"
                        try:
                            capabilities = RTCRtpReceiver.getCapabilities("video")
                            preferences = [c for c in capabilities.codecs if c.name == "VP8"]
                            if preferences:
                                transceiver.setCodecPreferences(preferences)
                                print("已鎖定 VP8 編碼偏好")
                        except Exception as e:
                            print(f"設定編碼偏好失敗: {e}")

                # 4. 產生 Answer
                # aiortc 會因為 configuration 裡有 iceServers 而自動進行 ICE Gathering
                answer = await self.pc.createAnswer()
                await self.pc.setLocalDescription(answer)
                
                # --- 關鍵修正：不再手動修改 SDP ---
                # 直接發送由 aiortc 採集完畢後的 SDP
                await self.send(text_data=json.dumps({
                    "type": "answer",
                    "sdp": self.pc.localDescription.sdp
                }))
                print(f"Answer 已發送，包含自動採集的 ICE Candidates")

        except Exception as e:
            print(f"Receive Error: {e}")
            traceback.print_exc()
import json
import os
import re
from channels.generic.websocket import AsyncWebsocketConsumer
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
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
        
        # 1. 建立 RTCPeerConnection
        self.pc = RTCPeerConnection()

        # 2. 監聽後端產生的 Candidate 並傳送給前端
        @self.pc.on("icecandidate")
        async def on_icecandidate(candidate):
            if candidate:
                # 取得伺服器公網 IP (建議從 settings 或環境變數讀取)
                external_ip = getattr(settings, 'EXTERNAL_IP', '你的伺服器公網IP')
                
                cand_sdp = candidate.to_sdp()
                # 將 172.x.x.x 替換為公網 IP
                fixed_cand_sdp = re.sub(r'(\d+\.\d+\.\d+\.\d+)', external_ip, cand_sdp)
                
                await self.send(text_data=json.dumps({
                    "type": "candidate",
                    "candidate": {
                        "candidate": f"candidate:{fixed_cand_sdp}",
                        "sdpMid": candidate.sdpMid,
                        "sdpMLineIndex": candidate.sdpMLineIndex
                    }
                }))

        # 原本的 Video Track 邏輯
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
        message_type = data.get("type")
        
        # 3. 處理 Offer
        if message_type == "offer":
            offer = RTCSessionDescription(sdp=data["sdp"], type=data["type"])
            await self.pc.setRemoteDescription(offer)
            
            answer = await self.pc.createAnswer()
            await self.pc.setLocalDescription(answer)
            
            # 修正 Answer SDP 中的 IP (解決 Docker 隔離)
            external_ip = getattr(settings, 'EXTERNAL_IP', '你的伺服器公網IP')
            fixed_sdp = re.sub(r'(\d+\.\d+\.\d+\.\d+)', external_ip, self.pc.localDescription.sdp)
            
            await self.send(text_data=json.dumps({
                "type": self.pc.localDescription.type,
                "sdp": fixed_sdp
            }))

        # 4. 處理前端傳來的 Candidate (包含 IPv6 過濾)
        elif message_type == "candidate":
            cand_dict = data.get("candidate")
            if cand_dict and cand_dict.get("candidate"):
                cand_line = cand_dict["candidate"]
                parts = cand_line.split()
                
                # 方法 B：過濾 IPv6 (如果地址欄位包含多個冒號)
                ip_address = parts[4]
                if ":" in ip_address and ip_address.count(":") > 1:
                    print(f"忽略 IPv6 Candidate: {ip_address}")
                    return

                try:
                    # 建立 aiortc Candidate 物件
                    candidate = RTCIceCandidate(
                        foundation=parts[0].split(":")[1] if ":" in parts[0] else parts[0],
                        component=int(parts[1]),
                        protocol=parts[2],
                        priority=int(parts[3]),
                        ip=ip_address,
                        port=int(parts[5]),
                        type=parts[7],
                        sdpMid=cand_dict.get("sdpMid"),
                        sdpMLineIndex=cand_dict.get("sdpMLineIndex")
                    )
                    await self.pc.addIceCandidate(candidate)
                except Exception as e:
                    print(f"解析 Candidate 失敗: {e}")
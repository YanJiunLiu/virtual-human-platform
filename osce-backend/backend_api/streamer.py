import av
import asyncio
import time
from aiortc import MediaStreamTrack
from fractions import Fraction

class VideoLoopTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, video_path):
        super().__init__()
        self.container = av.open(video_path)
        self.stream = self.container.streams.video[0]
        self.iterator = self.container.decode(self.stream)
        
        # 取得影片原始的 FPS，如果抓不到則預設 30
        self.fps = self.stream.average_rate
        if self.fps is None:
            self.fps = 30
        
        self.last_time = None
        self._timestamp = 0

    async def recv(self):
        # --- 核心限速邏輯 ---
        if self.last_time is not None:
            # 計算每一張影格之間應該間隔多久 (例如 1/30 秒)
            wait_time = (1 / self.fps) - (time.time() - self.last_time)
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        self.last_time = time.time()

        # 1. 讀取畫面
        try:
            frame = next(self.iterator)
        except (StopIteration, av.EOFError):
            self.container.seek(0)
            self.iterator = self.container.decode(self.stream)
            frame = next(self.iterator)

        # 2. 修正時間戳 (WebRTC 標準通常使用 90000 為 time_base)
        # 每秒 90000 個單位，若 30fps，每張圖間隔 3000
        self._timestamp += int(90000 / self.fps)
        
        # 建立新的影格並賦予正確的時鐘頻率
        new_frame = av.VideoFrame.from_image(frame.to_image())
        new_frame.pts = self._timestamp
        new_frame.time_base = Fraction(1, 90000)

        return new_frame
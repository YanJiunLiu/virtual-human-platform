import asyncio
import av
import time
from fractions import Fraction
from aiortc import MediaStreamTrack

class VideoLoopTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, video_path):
        super().__init__()
        self.video_path = video_path
        self._start_container()
        
        # 獲取幀率，若抓不到則預設 30
        self.fps = float(self.stream.average_rate) if self.stream.average_rate else 30.0
        
        self.last_time = None
        self._current_pts = 0
        self.TIME_BASE = 90000  # WebRTC 視訊標準 Timebase

        self.video_queue = asyncio.Queue()

    def _start_container(self):
        """初始化或重新開啟視訊檔案"""
        self.container = av.open(self.video_path)
        self.stream = self.container.streams.video[0]
        self.iterator = self.container.decode(self.stream)

    async def recv(self):
        # 1. 精確的時間控制 (Pacing)
        if self.last_time is not None:
            # 計算距離上一幀應該間隔多久
            elapsed = time.time() - self.last_time
            wait_time = (1.0 / self.fps) - elapsed
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        self.last_time = time.time()

        # 2. 獲取 Frame (優先從 Queue，其次從檔案)
        try:
            if not self.video_queue.empty():
                frame = await self.video_queue.get()
            else:
                frame = next(self.iterator)
        except (StopIteration, av.EOFError):
            self._start_container()
            frame = next(self.iterator)

        # 3. 處理影像轉換
        # 注意：直接使用 frame.to_ndarray() 再封裝比 to_image() 效率更高
        new_frame = av.VideoFrame.from_ndarray(
            frame.to_ndarray(format='yuv420p'), 
            format='yuv420p'
        )

        # 4. 設定時間戳 (與音訊邏輯對齊)
        new_frame.pts = self._current_pts
        new_frame.time_base = Fraction(1, self.TIME_BASE)
        
        # 每一幀增加的 PTS 量 = 90000 / FPS
        self._current_pts += int(self.TIME_BASE / self.fps)

        return new_frame

    async def add_video_to_streamer(self, video_path):
        container = av.open(video_path)
        stream = container.streams.video[0]
        for frame in container.decode(stream):
            new_frame = av.VideoFrame.from_image(frame.to_image())
            await self.video_queue.put(new_frame)
        container.close()

class AudioLoopTrack(MediaStreamTrack):
    kind = "audio"

    def __init__(self, audio_path):
        super().__init__()
        self.audio_path = audio_path
        self._start_container()
        
        self.FORMAT = "s16"
        self.LAYOUT = "mono"
        self.SAMPLE_RATE = 48000
        self.resampler = av.audio.resampler.AudioResampler(
            format=self.FORMAT,
            layout=self.LAYOUT,
            rate=self.SAMPLE_RATE
        )
        
        self._current_pts = 0
        self._current_frame_samples = 960 # 預設給一個初值（20ms）
        self.last_time = None
        self.audio_queue = asyncio.Queue()

    def _start_container(self):
        self.container = av.open(self.audio_path)
        self.stream = self.container.streams.audio[0]
        self.iterator = self.container.decode(self.stream)

    async def recv(self):
        if self.last_time is not None:
            wait_time = (self._current_frame_samples / self.SAMPLE_RATE) - (time.time() - self.last_time)
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        self.last_time = time.time()

        if not self.audio_queue.empty():
            new_frame = await self.audio_queue.get()
        else:
            try:
                frame = next(self.iterator)
            except (StopIteration, av.EOFError):
                self._start_container()
                frame = next(self.iterator)
            
            resampled_frames = self.resampler.resample(frame)
            if not resampled_frames:
                return await self.recv()
            new_frame = resampled_frames[0]

        new_frame.pts = self._current_pts
        new_frame.time_base = Fraction(1, self.SAMPLE_RATE)
        
        self._current_frame_samples = new_frame.samples
        self._current_pts += new_frame.samples
        
        return new_frame

    async def add_audio_to_streamer(self, audio_path):
        container = av.open(audio_path)
        stream = container.streams.audio[0]

        resampler = av.audio.resampler.AudioResampler(
            format=self.FORMAT,
            layout=self.LAYOUT,
            rate=self.SAMPLE_RATE
        )
        
        for frame in container.decode(stream):
            resampled_frames = resampler.resample(frame)
            
            for r_frame in resampled_frames:
                await self.audio_queue.put(r_frame)
                
        container.close()
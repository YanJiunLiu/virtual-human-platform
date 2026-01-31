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
        
        self.fps = self.stream.average_rate
        if self.fps is None:
            self.fps = 30
        
        self.last_time = None
        self._timestamp = 0

        self.video_queue = asyncio.Queue()
    
    async def add_video_to_streamer(self, video_path):
        container = av.open(video_path)
        stream = container.streams.video[0]
        for frame in container.decode(stream):
            new_frame = av.VideoFrame.from_image(frame.to_image())
            await self.video_queue.put(new_frame)
        container.close()

    async def recv(self):
        if self.last_time is not None:
            wait_time = (1 / self.fps) - (time.time() - self.last_time)
            if wait_time > 0:
                await asyncio.sleep(wait_time)
        
        self.last_time = time.time()

        if not self.video_queue.empty():
            # 1. 如果隊列有影格，優先播放 (例如對話影片)
            frame = await self.video_queue.get()
        else:
            # 2. 否則從循環影片中取 
            try:
                frame = next(self.iterator)
            except (StopIteration, av.EOFError):
                self.container.seek(0)
                self.iterator = self.container.decode(self.stream)
                frame = next(self.iterator)

        self._timestamp += int(90000 / self.fps)
        
        new_frame = av.VideoFrame.from_image(frame.to_image())
        new_frame.pts = self._timestamp
        new_frame.time_base = Fraction(1, 90000)

        return new_frame
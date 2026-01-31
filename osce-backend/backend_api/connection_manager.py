class ConnectionManager:
    def __init__(self):
        print("ConnectionManager init")
        self.active_tracks = {}

    def register_track(self, user_id, track):
        self.active_tracks[user_id] = track

    def unregister_track(self, user_id):
        if user_id in self.active_tracks:
            del self.active_tracks[user_id]

    def get_track(self, user_id):
        return self.active_tracks.get(user_id)

stream_manager = ConnectionManager()
import uuid
from typing import Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .room import Room

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Room] = {}

    async def connect(self, room_id: str, websocket: WebSocket, player_name: str):
        if room_id not in self.rooms:
            self.rooms[room_id] = Room(room_id)
        room = self.rooms[room_id]
        await websocket.accept()
        room.add_player(websocket, player_name)
        await room.broadcast({"type": "players", "players": room.players})

    def disconnect(self, room_id: str, websocket: WebSocket, player_name: str):
        room = self.rooms[room_id]
        room.remove_player(websocket, player_name)

    async def broadcast(self, room_id: str, message: dict):
        room = self.rooms[room_id]
        await room.broadcast(message)

    async def start_game(self, room_id: str):
        room = self.rooms[room_id]
        room.start_game()
        await room.broadcast({"type": "game_state", **room.state})

    async def play_card(self, room_id: str, player: str, card: str):
        room = self.rooms[room_id]
        if room.play_card(player, card):
            await room.broadcast({"type": "game_state", **room.state})

    async def draw_card(self, room_id: str, player: str):
        room = self.rooms[room_id]
        if room.draw_card(player):
            await room.broadcast({"type": "game_state", **room.state})


manager = ConnectionManager()


@app.websocket("/ws/{room_id}/{player_name}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, player_name: str):
    await manager.connect(room_id, websocket, player_name)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "start":
                await manager.start_game(room_id)
            elif data.get("type") == "play":
                await manager.play_card(room_id, player_name, data["card"])
            elif data.get("type") == "draw":
                await manager.draw_card(room_id, player_name)
            else:
                await manager.broadcast(room_id, data)
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket, player_name)
        await manager.broadcast(
            room_id, {"type": "players", "players": manager.rooms[room_id].players}
        )


@app.get("/create_room")
def create_room():
    room_id = str(uuid.uuid4())[:8]
    return {"room_id": room_id}

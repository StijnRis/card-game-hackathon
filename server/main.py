import uuid
from typing import Dict

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .cards import make_card
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
        room.connections.append(websocket)
        room.players.append(player_name)
        await self.broadcast(room_id, {"type": "players", "players": room.players})

    def disconnect(self, room_id: str, websocket: WebSocket, player_name: str):
        room = self.rooms[room_id]
        if websocket in room.connections:
            room.connections.remove(websocket)
        if player_name in room.players:
            room.players.remove(player_name)

    async def broadcast(self, room_id: str, message: dict):
        room = self.rooms[room_id]
        to_remove = []
        for connection in room.connections:
            try:
                await connection.send_json(message)
            except Exception:
                to_remove.append(connection)
        for connection in to_remove:
            room.connections.remove(connection)

    async def start_game(self, room_id: str):
        room = self.rooms[room_id]
        state = room.state
        players = room.players
        state["players"] = players.copy()
        state["hands"] = {p: [state["deck"].pop() for _ in range(5)] for p in players}
        state["discard"] = [state["deck"].pop()]
        top = state["discard"][-1]
        state["current_suit"] = top.split("_of_")[1]
        state["current_rank"] = top.split("_of_")[0]
        state["started"] = True
        state["turn"] = 0
        await self.broadcast(room_id, {"type": "game_state", **state})

    async def play_card(self, room_id: str, player: str, card: str):
        room = self.rooms[room_id]
        state = room.state
        if not state["started"]:
            return
        if state["players"][state["turn"]] != player:
            return
        card_obj = make_card(card)
        if not card_obj.can_play(state):
            return
        # Remove card from hand and add to discard
        state["hands"][player].remove(card)
        state["discard"].append(card)
        state["current_suit"] = card_obj.suit
        state["current_rank"] = card_obj.rank
        # Apply card effect
        card_obj.apply_effect(state)
        # Advance turn
        self._advance_turn(state)
        await self.broadcast(room_id, {"type": "game_state", **state})

    def _advance_turn(self, state):
        if state["skip"] > 0:
            state["turn"] = (state["turn"] + 2) % len(state["players"])
            state["skip"] = 0
        else:
            state["turn"] = (state["turn"] + 1) % len(state["players"])

    async def draw_card(self, room_id: str, player: str):
        room = self.rooms[room_id]
        state = room.state
        if not state["started"]:
            return
        if state["players"][state["turn"]] != player:
            return
        if not state["deck"]:
            # Reshuffle discard except top
            state["deck"] = state["discard"][:-1]
            state["discard"] = state["discard"][-1:]
            import random

            random.shuffle(state["deck"])
        if state["draw_stack"] > 0:
            for _ in range(state["draw_stack"]):
                if state["deck"]:
                    card = state["deck"].pop()
                    state["hands"][player].append(card)
            state["draw_stack"] = 0
        else:
            if state["deck"]:
                card = state["deck"].pop()
                state["hands"][player].append(card)
        self._advance_turn(state)
        await self.broadcast(room_id, {"type": "game_state", **state})


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

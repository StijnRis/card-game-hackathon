import uuid
from typing import Dict, List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

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
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.players: Dict[str, List[str]] = {}  # room_id -> list of player names
        self.game_states: Dict[str, dict] = {}  # room_id -> game state

    async def connect(self, room_id: str, websocket: WebSocket, player_name: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
            self.players[room_id] = []
            self.game_states[room_id] = self.init_game_state()
        self.active_connections[room_id].append(websocket)
        self.players[room_id].append(player_name)
        await self.broadcast(
            room_id, {"type": "players", "players": self.players[room_id]}
        )

    def disconnect(self, room_id: str, websocket: WebSocket, player_name: str):
        self.active_connections[room_id].remove(websocket)
        self.players[room_id].remove(player_name)

    async def broadcast(self, room_id: str, message: dict):
        to_remove = []
        for connection in self.active_connections[room_id]:
            try:
                await connection.send_json(message)
            except Exception:
                to_remove.append(connection)
        for connection in to_remove:
            self.active_connections[room_id].remove(connection)

    def init_game_state(self):
        # Initialize a Mau Mau deck (simplified: 4 suits, 7-10, J, Q, K, A)
        suits = ["hearts", "diamonds", "clubs", "spades"]
        ranks = ["7", "8", "9", "10", "J", "Q", "K", "A"]
        deck = [f"{rank}_of_{suit}" for suit in suits for rank in ranks]
        import random

        random.shuffle(deck)
        return {
            "started": False,
            "players": [],
            "deck": deck,
            "discard": [],
            "hands": {},
            "turn": 0,
            "current_suit": None,
            "current_rank": None,
        }

    async def start_game(self, room_id: str):
        state = self.game_states[room_id]
        players = self.players[room_id]
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
        state = self.game_states[room_id]
        if not state["started"] or state["players"][state["turn"]] != player:
            return
        # Validate card
        rank, suit = card.split("_of_")
        if rank != state["current_rank"] and suit != state["current_suit"]:
            return
        state["hands"][player].remove(card)
        state["discard"].append(card)
        state["current_suit"] = suit
        state["current_rank"] = rank
        # Next turn
        state["turn"] = (state["turn"] + 1) % len(state["players"])
        await self.broadcast(room_id, {"type": "game_state", **state})

    async def draw_card(self, room_id: str, player: str):
        state = self.game_states[room_id]
        if not state["started"] or state["players"][state["turn"]] != player:
            return
        if not state["deck"]:
            # Reshuffle discard except top
            state["deck"] = state["discard"][:-1]
            state["discard"] = state["discard"][-1:]
            import random

            random.shuffle(state["deck"])
        if state["deck"]:
            card = state["deck"].pop()
            state["hands"][player].append(card)
        # Next turn
        state["turn"] = (state["turn"] + 1) % len(state["players"])
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
            room_id, {"type": "players", "players": manager.players[room_id]}
        )


@app.get("/create_room")
def create_room():
    room_id = str(uuid.uuid4())[:8]
    return {"room_id": room_id}

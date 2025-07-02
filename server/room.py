import random
from typing import List

from fastapi import WebSocket

from .cards import make_card


class Room:
    def __init__(self, room_id):
        self.room_id = room_id
        self.connections: List[WebSocket] = []
        self.players: List[str] = []
        self.state = self.init_game_state()

    def init_game_state(self):
        suits = ["hearts", "diamonds", "clubs", "spades"]
        ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
        deck = [f"{rank}_of_{suit}" for suit in suits for rank in ranks]
        random.shuffle(deck)
        return {
            "started": False,
            "players": [],
            "deck": deck,
            "discard": [],
            "hands": {},
            "turn": 0,
            "current_card": None,
            "skip": 0,
            "draw_stack": 0,
        }

    def add_player(self, websocket: WebSocket, player_name: str):
        self.connections.append(websocket)
        self.players.append(player_name)

    def remove_player(self, websocket: WebSocket, player_name: str):
        if websocket in self.connections:
            self.connections.remove(websocket)
        if player_name in self.players:
            self.players.remove(player_name)

    async def broadcast(self, message: dict):
        to_remove = []
        for connection in self.connections:
            try:
                await connection.send_json(message)
            except Exception:
                to_remove.append(connection)
        for connection in to_remove:
            self.connections.remove(connection)

    def start_game(self):
        state = self.state
        players = self.players
        state["players"] = players.copy()
        state["hands"] = {p: [state["deck"].pop() for _ in range(5)] for p in players}
        state["discard"] = [state["deck"].pop()]
        top = state["discard"][-1]
        state["current_card"] = make_card(top)
        state["started"] = True
        state["turn"] = 0

    def play_card(self, player: str, card: str):
        state = self.state
        if not state["started"]:
            return False
        if state["players"][state["turn"]] != player:
            return False
        card_obj = make_card(card)
        if not card_obj.can_play(state):
            return False
        state["hands"][player].remove(card)
        state["discard"].append(card)
        state["current_card"] = card_obj
        card_obj.apply_effect(state)
        self._advance_turn()
        return True

    def _advance_turn(self):
        state = self.state
        if state["skip"] > 0:
            state["turn"] = (state["turn"] + 2) % len(state["players"])
            state["skip"] = 0
        else:
            state["turn"] = (state["turn"] + 1) % len(state["players"])

    def draw_card(self, player: str):
        state = self.state
        if not state["started"]:
            return False
        if state["players"][state["turn"]] != player:
            return False
        if not state["deck"]:
            state["deck"] = state["discard"][:-1]
            state["discard"] = state["discard"][-1:]
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
        self._advance_turn()
        return True

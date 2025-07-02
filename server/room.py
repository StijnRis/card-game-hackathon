from typing import List

from fastapi import WebSocket


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
        import random

        random.shuffle(deck)
        return {
            "started": False,
            "players": [],
            "deck": deck,
            "discard": [],
            "hands": {},
            "turn": 0,
            "current_card": None,  # store as Card instance
            "skip": 0,
            "draw_stack": 0,
        }

class Card:
    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit
        self.name = f"{rank}_of_{suit}"

    def can_play(self, state):
        return self.rank == state["current_rank"] or self.suit == state["current_suit"]

    def apply_effect(self, state):
        pass

class Card7(Card):
    def apply_effect(self, state):
        state["draw_stack"] += 2

class Card8(Card):
    def apply_effect(self, state):
        state["skip"] = 1

class CardJ(Card):
    def can_play(self, state):
        return True
    def apply_effect(self, state):
        pass

class CardA(Card):
    def apply_effect(self, state):
        pass

CARD_CLASS_MAP = {
    "7": Card7,
    "8": Card8,
    "J": CardJ,
    "A": CardA,
}

def make_card(card_str):
    rank, suit = card_str.split("_of_")
    return CARD_CLASS_MAP.get(rank, Card)(rank, suit)

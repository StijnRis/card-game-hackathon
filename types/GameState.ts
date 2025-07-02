import { Card } from "./Card";
import { Player } from "./Player";

export interface GameState {
    players: Player[];
    deck: Card[];
    playedCards: Card[];
    currentPlayerId: string;
    topCard: Card;
    started: boolean;
    winnerId?: string;
}

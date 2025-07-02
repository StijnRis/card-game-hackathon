import { Card } from "../types/Card";
import { GameState } from "../types/GameState";
import { Player } from "../types/Player";

// Extensible card rules system
export type CardRule = (
    card: Card,
    gameState: GameState,
    player: Player
) => GameState;

export interface CardDefinition {
    type: string;
    rule: CardRule;
}

export class GameEngine {
    cardDefinitions: Record<string, CardDefinition> = {};

    constructor(cardDefinitions: CardDefinition[]) {
        for (const def of cardDefinitions) {
            this.cardDefinitions[def.type] = def;
        }
    }

    playCard(card: Card, player: Player, gameState: GameState): GameState {
        const def = this.cardDefinitions[card.type || "default"];
        if (def) {
            return def.rule(card, gameState, player);
        }
        // Default: just move card to played pile and next player
        const newState = { ...gameState };
        newState.playedCards = [...gameState.playedCards, card];
        newState.topCard = card;
        // Advance turn logic here
        return newState;
    }

    // Add more game logic as needed
}

// Example card definitions
export const defaultCardDefinitions: CardDefinition[] = [
    {
        type: "default",
        rule: (card, gameState, player) => {
            // Basic rule: play card, advance turn
            const newState = { ...gameState };
            newState.playedCards = [...gameState.playedCards, card];
            newState.topCard = card;
            // Advance turn logic here
            return newState;
        },
    },
    // Add more card types here
];

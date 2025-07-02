import React from "react";
import { Card as CardType } from "../../types/Card";
import Card from "./Card";

interface PlayerHandProps {
    cards: CardType[];
    onPlay: (card: CardType) => void;
    playableCards: string[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({
    cards,
    onPlay,
    playableCards,
}) => {
    return (
        <div className="flex flex-row justify-center mt-4">
            {cards.map((card) => (
                <Card
                    key={card.id}
                    card={card}
                    onClick={() =>
                        playableCards.includes(card.id) && onPlay(card)
                    }
                    isPlayable={playableCards.includes(card.id)}
                />
            ))}
        </div>
    );
};

export default PlayerHand;

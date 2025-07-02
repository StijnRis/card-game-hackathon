import React from "react";
import { Card as CardType } from "../../types/Card";

interface GameBoardProps {
    topCard: CardType;
    playedCards: CardType[];
}

const GameBoard: React.FC<GameBoardProps> = ({ topCard, playedCards }) => {
    return (
        <div className="flex flex-col items-center mt-8">
            <div className="mb-2 text-lg">Top Card</div>
            <div className="mb-4">
                <div className="inline-block">
                    <div className="w-20 h-32 rounded-lg shadow-lg flex flex-col items-center justify-center border-4 border-orange-400 bg-white">
                        <span className="text-3xl font-bold">
                            {topCard.symbol}
                        </span>
                        <span className="text-xl">{topCard.suit}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-row gap-2">
                {playedCards.slice(-5).map((card) => (
                    <div
                        key={card.id}
                        className="w-10 h-16 rounded bg-gray-200 flex items-center justify-center text-xs"
                    >
                        {card.symbol}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameBoard;

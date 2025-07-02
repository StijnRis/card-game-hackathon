import React from "react";
import { Card as CardType } from "../../types/Card";

interface CardProps {
    card: CardType;
    onClick?: () => void;
    isPlayable?: boolean;
}

const Card: React.FC<CardProps> = ({ card, onClick, isPlayable }) => {
    return (
        <div
            className={`w-16 h-24 rounded-lg shadow-md flex flex-col items-center justify-center m-1 cursor-pointer border-2 ${
                isPlayable ? "border-green-500" : "border-gray-300"
            }`}
            onClick={onClick}
            style={{ background: card.color }}
        >
            <span className="text-2xl font-bold">{card.symbol}</span>
            <span className="text-lg">{card.suit}</span>
        </div>
    );
};

export default Card;

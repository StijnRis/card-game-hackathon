import React from "react";
import { Player } from "../../types/Player";

interface PlayerListProps {
    players: Player[];
    currentPlayerId: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
    players,
    currentPlayerId,
}) => {
    return (
        <div className="flex flex-row justify-center gap-8 mt-6">
            {players.map((player) => (
                <div
                    key={player.id}
                    className={`flex flex-col items-center ${
                        player.id === currentPlayerId
                            ? "font-bold text-orange-600"
                            : ""
                    }`}
                >
                    <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center text-xl mb-1">
                        {player.avatar}
                    </div>
                    <span>{player.name}</span>
                </div>
            ))}
        </div>
    );
};

export default PlayerList;

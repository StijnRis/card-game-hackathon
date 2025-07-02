"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { connectToRoom, sendPlayerAction } from "../../../lib/socket";
import { Card } from "../../../types/Card";
import { GameState } from "../../../types/GameState";
import GameBoard from "../../components/GameBoard";
import PlayerHand from "../../components/PlayerHand";
import PlayerList from "../../components/PlayerList";

const mockPlayerId = "me"; // Replace with real auth

const RoomPage: React.FC = () => {
    const params = useParams();
    const roomCode = params?.roomCode as string;
    const [gameState, setGameState] = useState<GameState | null>(null);

    useEffect(() => {
        connectToRoom(roomCode, setGameState);
    }, [roomCode]);

    if (!gameState) return <div>Loading room...</div>;

    const me = gameState.players.find((p) => p.id === mockPlayerId)!;
    const myHand = (me as any).hand as Card[];
    const playableCards = myHand.map((card) => card.id); // TODO: filter by rules

    const handlePlay = (card: Card) => {
        sendPlayerAction(roomCode, { type: "play", cardId: card.id });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 to-pink-200 flex flex-col items-center">
            <h1 className="text-3xl font-bold mt-6 mb-2">Room: {roomCode}</h1>
            <PlayerList
                players={gameState.players}
                currentPlayerId={gameState.currentPlayerId}
            />
            <GameBoard
                topCard={gameState.topCard}
                playedCards={gameState.playedCards}
            />
            <PlayerHand
                cards={myHand}
                onPlay={handlePlay}
                playableCards={playableCards}
            />
        </div>
    );
};

export default RoomPage;

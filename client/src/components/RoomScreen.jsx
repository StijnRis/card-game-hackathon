import { useEffect, useState } from "react";
import PlayerList from "./PlayerList";

export default function RoomScreen({ room, name }) {
    const [players, setPlayers] = useState([]);
    const [ws, setWs] = useState(null);
    const [game, setGame] = useState(null);

    useEffect(() => {
        const socket = new WebSocket(
            `ws://localhost:8000/ws/${room}/${name}`
        );
        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "players") setPlayers(msg.players);
            if (msg.type === "game_state") setGame(msg);
        };
        setWs(socket);
        return () => socket.close();
    }, [room, name]);

    const startGame = () => ws && ws.send(JSON.stringify({ type: "start" }));
    const playCard = (card) =>
        ws && ws.send(JSON.stringify({ type: "play", card }));
    const drawCard = () => ws && ws.send(JSON.stringify({ type: "draw" }));

    if (!game || !game.started) {
        return (
            <div className="h-screen flex flex-col justify-between">
                <h2 className="text-xl">Room: {room}</h2>

                <div>
                    <h3>Players:</h3>
                    <PlayerList players={players} currentTurn={-1} />
                    <button onClick={startGame} disabled={players.length < 1}>
                        Start Game
                    </button>
                </div>

                <div></div>
            </div>
        );
    }

    const hand = game.hands?.[name] || [];
    const topCard = game.discard?.[game.discard.length - 1];
    const isMyTurn = game.players[game.turn] === name;

    return (
        <div className="h-screen flex flex-col justify-between">
            <h2 className="text-xl">Room: {room}</h2>

            <div>
            <h3 className="mb-4">Players:</h3>
            <PlayerList players={game.players} currentTurn={game.turn} />
            <div className="mb-8">
                Top card: <b>{topCard}</b>
            </div>
            <div className="mb-4">Your hand:</div>
            <div className="mb-8">
                {hand.map((card) => (
                    <button
                        key={card}
                        onClick={() => playCard(card)}
                        disabled={!isMyTurn}
                        style={{ margin: 4 }}
                    >
                        {card}
                    </button>
                ))}
            </div>
            <div>
                <button onClick={drawCard} disabled={!isMyTurn}>
                    Draw Card
                </button>
            </div>
            </div>
            <div>
                {isMyTurn
                    ? "Your turn!"
                    : `Waiting for ${game.players[game.turn]}`}
            </div>
        </div>
    );
}

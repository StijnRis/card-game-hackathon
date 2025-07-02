import { useEffect, useState } from "react";
import "./App.css";

function MainScreen({ onJoin }) {
    const [room, setRoom] = useState("");
    const [name, setName] = useState("");

    const handleCreate = async () => {
        const res = await fetch("http://localhost:8000/create_room");
        const data = await res.json();
        onJoin(data.room_id, name);
    };

    const handleJoin = () => {
        if (room && name) onJoin(room, name);
    };

    return (
        <div style={{ textAlign: "center", marginTop: 100 }}>
            <h1>Mau Mau Online</h1>
            <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div style={{ margin: 10 }}>
                <button onClick={handleCreate} disabled={!name}>
                    Create Room
                </button>
            </div>
            <input
                placeholder="Room code"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={handleJoin} disabled={!room || !name}>
                Join Room
            </button>
        </div>
    );
}

function RoomScreen({ room, name }) {
    const [players, setPlayers] = useState([]);
    const [ws, setWs] = useState(null);
    const [game, setGame] = useState(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/${room}/${name}`);
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
            <div style={{ textAlign: "center", marginTop: 50 }}>
                <h2>Room: {room}</h2>
                <h3>Players:</h3>
                <ul>
                    {players.map((p) => (
                        <li key={p}>{p}</li>
                    ))}
                </ul>
                <button onClick={startGame} disabled={players.length < 2}>
                    Start Game
                </button>
            </div>
        );
    }

    const hand = game.hands?.[name] || [];
    const topCard = game.discard?.[game.discard.length - 1];
    const isMyTurn = game.players[game.turn] === name;

    return (
        <div style={{ textAlign: "center", marginTop: 50 }}>
            <h2>Room: {room}</h2>
            <h3>Players: {game.players.join(", ")}</h3>
            <div>
                Top card: <b>{topCard}</b>
            </div>
            <div>Your hand:</div>
            <div>
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
            <div>
                {isMyTurn
                    ? "Your turn!"
                    : `Waiting for ${game.players[game.turn]}`}
            </div>
        </div>
    );
}

export default function App() {
    const [joined, setJoined] = useState(false);
    const [room, setRoom] = useState("");
    const [name, setName] = useState("");

    if (!joined) {
        return (
            <MainScreen
                onJoin={(room, name) => {
                    setRoom(room);
                    setName(name);
                    setJoined(true);
                }}
            />
        );
    }
    return <RoomScreen room={room} name={name} />;
}

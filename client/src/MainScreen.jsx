import { useState } from "react";

export default function MainScreen({ onJoin }) {
    const [room, setRoom] = useState("");
    const [name, setName] = useState("");

    const handleCreate = async () => {
        const res = await fetch("http://192.168.11.30:8000/create_room");
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

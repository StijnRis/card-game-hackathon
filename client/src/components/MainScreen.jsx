import { useState } from "react";

export default function MainScreen({ onJoin }) {
    const [room, setRoom] = useState("");
    const [name, setName] = useState("");

    const handleCreate = async () => {
        if(!name) {alert("Please enter your name"); return;}
        const res = await fetch("http://localhost:8000/create_room");
        const data = await res.json();
        onJoin(data.room_id, name);
    };

    const handleJoin = () => {
        if (room && name) {onJoin(room, name)}
        else {
            if(!name) {
                alert("Please enter your name");
            }
            if(!room) {
                alert("Please enter a room code");
            }
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: 100 }}>
            <h1 className="mb-4">CardGame</h1>
            <input
                className="input mb-8"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div style={{ margin: 10 }}>
                <button onClick={handleCreate}>
                    Create Room
                </button>
               
            </div>
             <p className="mb-4">Or</p>
            <input
                className="input mr-4"
                placeholder="Room code"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={handleJoin}>
                Join Room
            </button>
        </div>
    );
}

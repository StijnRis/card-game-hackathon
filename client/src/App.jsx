import { useEffect, useState } from "react";
import "./App.css";
import MainScreen from "./MainScreen";
import RoomScreen from "./RoomScreen";

export default function App() {
    const [joined, setJoined] = useState(false);
    const [room, setRoom] = useState("");
    const [name, setName] = useState("");

    // On mount, check if room code is in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlRoom = params.get("room");
        if (urlRoom) {
            setRoom(urlRoom);
            setJoined(true);
        }
    }, []);

    // When joining, update the URL
    const handleJoin = (room, name) => {
        setRoom(room);
        setName(name);
        setJoined(true);
        const params = new URLSearchParams(window.location.search);
        params.set("room", room);
        window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${params}`
        );
    };

    if (!joined) {
        return <MainScreen onJoin={handleJoin} />;
    }
    return <RoomScreen room={room} name={name} />;
}

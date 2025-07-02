// This is a placeholder for a real-time communication system (e.g., socket.io)
// In a real app, you would implement server-side logic and connect here.
// For demo, this is a stub.

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectToRoom(
    roomCode: string,
    onUpdate: (state: any) => void
) {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
    }
    socket.emit("join_room", roomCode);
    socket.off("room_update");
    socket.on("room_update", (state) => {
        onUpdate(state);
    });
}

export function sendPlayerAction(roomCode: string, action: any) {
    if (socket) {
        socket.emit("player_action", { roomCode, action });
    }
}

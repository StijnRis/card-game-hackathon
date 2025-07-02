"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const RoomJoinForm: React.FC = () => {
    const [roomCode, setRoomCode] = useState("");
    const router = useRouter();

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomCode.trim()) {
            router.push(`/room/${roomCode.trim()}`);
        }
    };

    const handleCreate = () => {
        const newCode = generateRoomCode();
        router.push(`/room/${newCode}`);
    };

    return (
        <form
            onSubmit={handleJoin}
            className="flex flex-col items-center gap-4 mt-10"
        >
            <input
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="border rounded px-4 py-2 text-lg"
            />
            <div className="flex gap-4">
                <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 py-2 rounded"
                >
                    Join Room
                </button>
                <button
                    type="button"
                    onClick={handleCreate}
                    className="bg-green-500 text-white px-6 py-2 rounded"
                >
                    Create Room
                </button>
            </div>
        </form>
    );
};

export default RoomJoinForm;

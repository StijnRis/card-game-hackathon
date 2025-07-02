import React from "react";
import RoomJoinForm from "./components/RoomJoinForm";

const HomePage: React.FC = () => {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-pink-200">
            <h1 className="text-4xl font-bold mb-4">
                Welcome to the Online Card Game!
            </h1>
            <RoomJoinForm />
            <div className="mt-10 text-gray-500">
                Enter a room code to join or create a game room.
            </div>
        </main>
    );
};

export default HomePage;

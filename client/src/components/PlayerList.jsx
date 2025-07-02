export default function PlayerList({ players, currentTurn }) {
    return (
        <ul style={{ listStyle: "none", padding: 0 }} className="mb-4">
            {players.map((p, idx) => (
                <li
                    key={p}
                    style={{
                        fontWeight: idx === currentTurn ? "bold" : "normal",
                    }}
                >
                    {p} {idx === currentTurn ? "←" : ""}
                </li>
            ))}
        </ul>
    );
}

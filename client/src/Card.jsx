import "./Card.css";

export default function Card({ card, onClick, disabled }) {
    if (!card) return null;
    return (
        <button
            className="card-btn"
            onClick={onClick}
            disabled={disabled}
            style={{
                background: "none",
                border: "none",
                padding: 0,
                margin: 4,
            }}
        >
            <img
                src={card.image || `/cards/${card.name}.svg`}
                alt={card.name}
                className="card-img"
                style={{
                    width: 60,
                    height: 90,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px #0003",
                }}
            />
            <div style={{ fontSize: 12, color: "#333" }}>
                {card.name.replace(/_/g, " ")}
            </div>
        </button>
    );
}

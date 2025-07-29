import React, { useState } from "react";
import { Rnd } from "react-rnd";
import axios from "axios";

interface TickerSymbolProps {
  onSymbolChange: (symbol: string) => void;
  currentSymbol: string;
}

const TickerSymbol: React.FC<TickerSymbolProps> = ({ onSymbolChange, currentSymbol }) => {
  const [input, setInput] = useState(currentSymbol || "BTCUSDT");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value.toUpperCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // inform the backend about the ticker symbol change
      await axios.post("http://localhost:8080/api/kline-symbol", { symbol: input });
      onSymbolChange(input);
      setMessage("Switched to " + input + ".");
    } catch (err) {
      setMessage("Switch failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Rnd
      default={{
        x: 960,
        y: -400,
        width: 350,
        height: 220,
      }}
      minWidth={300}
      minHeight={120}
      bounds="window"
      dragHandleClassName="drag-handle"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          border: "1px solid #ddd",
          borderRadius: 4,
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          className="drag-handle"
          style={{
            cursor: "move",
            backgroundColor: "#800080",
            color: "white",
            padding: "8px 16px",
            userSelect: "none",
            fontWeight: "bold",
          }}
        >
          Ticker Symbol Input （drag this area to move）
        </div>
		
		<div style={{ padding: 16, flex: 1, backgroundColor: "#f0f0f0" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="(e.g., BTCUSDT)"
              style={{
                color: "black",
                padding: 8,
                borderRadius: 4,
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                textTransform: "uppercase",
              }}
              maxLength={15}
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                padding: 8,
                backgroundColor: "#008000",
                color: "#fff",
                borderRadius: 4,
                border: "none",
                fontWeight: "bold",
              }}
              disabled={loading}
            >
              Switch Ticker
            </button>
            {message && (
				<div
					style={{
						padding: 8,
						backgroundColor: "#e3f2fd",
						color: "#1976d2",
						borderRadius: 4,
						border: "1px solid #1976d2",
						fontWeight: "bold",
						userSelect: "none",
					}}
				>
					{message}
				</div>
            )}
          </form>
        </div>
      </div>
    </Rnd>
  );
};

export default TickerSymbol;
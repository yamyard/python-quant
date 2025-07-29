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
      // 通知后端变更交易对
      await axios.post("http://localhost:8080/api/kline-symbol", { symbol: input });
      onSymbolChange(input);
      setMessage("已切换为：" + input);
    } catch (err) {
      setMessage("切换失败，请重试！");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Rnd
      default={{
        x: 200,
        y: -200,
        width: 350,
        height: 140,
      }}
      minWidth={300}
      minHeight={100}
      bounds="window"
      dragHandleClassName="drag-handle"
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid #ddd", borderRadius: 4, background: "#fff" }}>
        <div
          className="drag-handle"
          style={{
            cursor: "move",
            backgroundColor: "#1976d2",
            color: "white",
            padding: "8px 16px",
            userSelect: "none",
            fontWeight: "bold",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        >
          选择币安交易对（拖拽此处移动）
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          <label style={{ marginBottom: 8 }}>
            请输入币安交易对（如 BTCUSDT）:
          </label>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            style={{
              fontSize: 18,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #aaa",
              width: 180,
              textTransform: "uppercase",
            }}
            maxLength={15}
            disabled={loading}
          />
          <button
            type="submit"
            style={{ marginTop: 10, padding: "4px 16px", borderRadius: 4, background: "#1976d2", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }}
            disabled={loading}
          >
            {loading ? "切换中..." : "切换"}
          </button>
          {message && (
            <div style={{ marginTop: 10, color: "#1976d2" }}>{message}</div>
          )}
        </form>
      </div>
    </Rnd>
  );
};

export default TickerSymbol;
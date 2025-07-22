import React, { useState } from "react";
import { Rnd } from "react-rnd";
import axios from "axios";

const defaultSignal = {
  id: "",
  symbol: "",
  value: "",
  timestamp: "",
  source: "",
  comment: ""
};

const SignalDisplay: React.FC = () => {
  const [signal, setSignal] = useState(defaultSignal);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignal({ ...signal, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8080/api/signal", signal);
      setSignal(defaultSignal);
      alert("信号已提交！");
    } catch (e) {
      alert("提交失败");
    }
  };

  const handleDelete = async () => {
    if (!signal.id) {
      alert("请填写需要删除的信号ID");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/signal/${signal.id}`);
      alert(`信号 ${signal.id} 已删除！`);
      setSignal(defaultSignal);
    } catch (e) {
      alert("删除失败或信号不存在");
    }
  };

  return (
    <Rnd
      default={{
        x: 100,
        y: 260,
        width: 400,
        height: 420,
      }}
      minWidth={300}
      minHeight={200}
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
        {/* 顶部可拖动条 */}
        <div
          className="drag-handle"
          style={{
            cursor: "move",
            backgroundColor: "#FFA500",
            color: "white",
            padding: "8px 16px",
            userSelect: "none",
            fontWeight: "bold",
          }}
        >
          SignalUnit 输入（拖动此区域移动）
        </div>

        {/* 表单区域 */}
        <div style={{ padding: 16, flex: 1, backgroundColor: "#f0f0f0" }}>
          <form style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.keys(defaultSignal).map(key => (
              <input
                key={key}
                name={key}
                value={signal[key as keyof typeof signal]}
                placeholder={key}
                onChange={handleChange}
                style={{
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                }}
              />
            ))}
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                padding: 8,
                background: "#008000",
                color: "#fff",
                borderRadius: 4,
                border: "none",
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              提交信号
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                padding: 8,
                background: "#d32f2f",
                color: "#fff",
                borderRadius: 4,
                border: "none",
                fontWeight: "bold",
                marginTop: 8,
              }}
            >
              根据ID删除信号
            </button>
          </form>
        </div>
      </div>
    </Rnd>
  );
};

export default SignalDisplay;

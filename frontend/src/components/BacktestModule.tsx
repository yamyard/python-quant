import React from "react";
import { Rnd } from "react-rnd";

const BacktestModule: React.FC = () => {
    return (
        <Rnd
            default={{
                x: 520,
                y: 260,
                width: 800,
                height: 420,
            }}
            minWidth={200}
            minHeight={100}
            bounds="window"
            dragHandleClassName="empty-drag-handle"
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
                    className="empty-drag-handle"
                    style={{
                        cursor: "move",
                        backgroundColor: "#8B4513",
                        color: "white",
                        padding: "8px 16px",
                        userSelect: "none",
                        fontWeight: "bold",
                    }}
                >
                    Backtest （drag this area to move）
                </div>
                <div style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
                </div>
            </div>
        </Rnd>
    );
};

export default BacktestModule;
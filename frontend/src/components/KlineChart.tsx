import React, { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import { Rnd } from "react-rnd";

interface Kline {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface SignalUnit {
  id: string;
  symbol: string;
  value: string;
  timestamp: string;
  source: string;
  comment: string;
}

const KlineChart: React.FC = () => {
  const [data, setData] = useState<Kline[]>([]);
  const [signals, setSignals] = useState<SignalUnit[]>([]);
  const [layout, setLayout] = useState<any>({
    title: "BTCUSDT 实时 1m K线图",
    xaxis: { type: "date" },
    yaxis: { autorange: true },
    dragmode: "zoom",
  });
  const isInitialLoad = useRef(true);

  useEffect(() => {
    axios.get("http://localhost:8080/api/kline")
      .then(res => setData(res.data))
      .catch(console.error);

    const ws = new WebSocket("ws://localhost:8080/ws/kline");
    ws.onmessage = (event) => {
      try {
        const newPoint: Kline = JSON.parse(event.data);
        setData(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.timestamp === newPoint.timestamp) {
            updated[updated.length - 1] = newPoint;
          } else {
            updated.push(newPoint);
            if (updated.length > 50) updated.shift();
          }
          return updated;
        });
      } catch (e) {
        console.error("Invalid WS data", e);
      }
    };
    return () => ws.close();
  }, []);

  // 拉取所有信号数据
  useEffect(() => {
    const fetchSignals = () => {
      axios.get("http://localhost:8080/api/signals")
        .then(res => setSignals(res.data))
        .catch(console.error);
    };
    fetchSignals();
    // 定时刷新信号
    const interval = setInterval(fetchSignals, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRelayout = (event: any) => {
    if (!isInitialLoad.current) {
      setLayout((prevLayout: any) => ({
        ...prevLayout,
        ...event
      }));
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      isInitialLoad.current = false;
    }
  }, [data]);

  // 转换信号为Plotly annotations
  const annotations = signals.map(sig => ({
    x: new Date(Number(sig.timestamp)),
    y: sig.value ? Number(sig.value) : undefined,
    text: `${sig.symbol}: ${sig.value}\n${sig.comment || ""}`,
    showarrow: true,
    arrowhead: 4,
    ax: 0,
    ay: -40,
    bgcolor: "#ffe082",
    bordercolor: "#1976d2",
    font: { color: "#1976d2", size: 12 },
  }));

  return (
    <Rnd
      default={{
        x: 100,
        y: -400,
        width: 800,
        height: 600,
      }}
      minWidth={400}
      minHeight={300}
      bounds="window"
      dragHandleClassName="drag-handle"
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", border: "1px solid #ddd", borderRadius: 4, background: "#fff" }}>
        {/* 只有这个header区域可拖动 */}
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
          BTCUSDT 实时 1m K线图（拖动此区域移动）
        </div>

        {/* 图表主体区域 */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <Plot
            data={[
              {
                x: data.map(d => new Date(d.timestamp)),
                open: data.map(d => d.open),
                high: data.map(d => d.high),
                low: data.map(d => d.low),
                close: data.map(d => d.close),
                type: "candlestick",
              }
            ]}
            layout={{
              ...layout,
              autosize: true,
              width: undefined,
              height: undefined,
              annotations: annotations,
			  plot_bgcolor: "#e0e0e0",
			  paper_bgcolor: "#f0f0f0",
            }}
            onRelayout={handleRelayout}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
            config={{ responsive: true }}
          />
        </div>
      </div>
    </Rnd>
  );
};

export default KlineChart;
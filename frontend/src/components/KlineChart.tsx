import React, { useEffect, useState, useRef } from "react";

import axios from "axios";
import Plot from "react-plotly.js";
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

// define main react component
const KlineChart: React.FC = () => {
  // kline data state
  const [data, setData] = useState<Kline[]>([]);
  // signal data state
  const [signals, setSignals] = useState<SignalUnit[]>([]);
  // Plotly layout config
  const [layout, setLayout] = useState<any>({
    title: "BTCUSDT Kline Chart",
    xaxis: { type: "date" },
    yaxis: { autorange: true },
    dragmode: "zoom",
  });
  // flag for first load
  const isInitialLoad = useRef(true);

  // load historical kline data and connect WebSocket to get real time data
  useEffect(() => {
    axios.get("http://localhost:8080/api/kline")
      .then(res => setData(res.data))
      .catch(console.error);

    const ws = new WebSocket("ws://localhost:8080/api/ws/kline");
    
	ws.onmessage = (event) => {
      try {
        const newPoint: Kline = JSON.parse(event.data);
        setData(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
		  // replace last bar if timestamp matches
          if (last && last.timestamp === newPoint.timestamp) {
			updated[updated.length - 1] = newPoint;
		  // else add new bar
          } else {
            updated.push(newPoint);
            // keep max 50 bars
			if (updated.length > 50) updated.shift();
          }
          return updated;
        });
      } catch (e) {
        console.error("Invalid WS data", e);
      }
    };
	// close WebSocket on unmount
    return () => ws.close();
  }, []);

  // fetch signal data periodically
  useEffect(() => {
    const fetchSignals = () => {
      axios.get("http://localhost:8080/api/signals")
        .then(res => setSignals(res.data))
        .catch(console.error);
    };
    fetchSignals();
    // refresh every 5 seconds
    const interval = setInterval(fetchSignals, 5000);
    // cleanup on unmount
	return () => clearInterval(interval);
  }, []);

  // handle user relaylout event
  const handleRelayout = (event: any) => {
    if (!isInitialLoad.current) {
      setLayout((prevLayout: any) => ({
        ...prevLayout,
        ...event
      }));
    }
  };

  // mark as loaded only when data exists
  useEffect(() => {
    if (data.length > 0) {
      isInitialLoad.current = false;
    }
  }, [data]);

  // convert signal list to Plotly annotations
  const annotations = signals.map(sig => ({
	// convert timestamp to date
    x: new Date(Number(sig.timestamp)),
	y: sig.value ? Number(sig.value) : undefined,
	// display text
    text: `${sig.symbol}: ${sig.value}\n${sig.comment || ""}`,
    showarrow: true,
    arrowhead: 4,
    ax: 0,
    ay: -40,
    bgcolor: "#ffe082",
    bordercolor: "#1976d2",
    font: { color: "#1976d2", size: 12 },
  }));

  // Rnd enclosure
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
          BTCUSDT Kline Chart （drag this area to move）
        </div>

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
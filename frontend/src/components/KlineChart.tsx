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

// calculate MA line
function calculateMA(data: Kline[], windowSize: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      const slice = data.slice(i - windowSize + 1, i + 1);
      const avg = slice.reduce((sum, d) => sum + d.close, 0) / windowSize;
      result.push(avg);
    }
  }
  return result;
}

// define main react component
const KlineChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  // kline data state
  const [data, setData] = useState<Kline[]>([]);
  // signal data state
  const [signals, setSignals] = useState<SignalUnit[]>([]);
  // Plotly layout config
  const [layout, setLayout] = useState<any>({
    title: "{symbol} Kline Chart",
    xaxis: { type: "date" },
    yaxis: { autorange: true },
    dragmode: "zoom",
  });
  // flag for first load
  const isInitialLoad = useRef(true);
  // check WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  
  // load historical kline data and connect WebSocket to get real time data
  useEffect(() => {
	let ignore = false;
	// get date with ticker symbol
    axios.get("http://localhost:8080/api/kline", { params: { symbol } })
      .then(res => {
		if (!ignore) setData(res.data);
	  })
      .catch(console.error);

	// restart WebSocket on ticker symbol
	if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket("ws://localhost:8080/api/ws/kline?symbol=" + symbol);
	wsRef.current = ws;
    
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
            // keep max 200 bars
			if (updated.length > 200) updated.shift();
          }
          return updated;
        });
      } catch (e) {
        console.error("Invalid WS data", e);
      }
    };
	// close WebSocket on unmount
    return () => {
		ignore = true;
		ws.close();
	};
  }, [symbol]);
  
  // 测试文本
  useEffect(() => {
    setLayout((prev: any) => ({
      ...prev,
      title: `${symbol} Kline Chart`
    }));
  }, [symbol]);

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

  // convert signal list to Plotly shapes
  const shapes = signals.map(sig => ({
	// convert timestamp to date
	type: "line",
    x0: new Date(sig.timestamp),
	x1: new Date(sig.timestamp),
	y0: 0,
	y1: 1,
	xref: "x",
	yref: "paper",
	// display a vertical line
	line: {
		color: "#1976d2",
		width: 2,
	},
  }));

  // convert signal list to Plotly annotations
  const annotations = signals.map(sig => ({
	// convert timestamp to date
    x: new Date(sig.timestamp),
	y: 0.05,
	xref: "x",
	yref: "paper",
	// display text
	text: `Value: ${sig.value || ""}<br>Source: ${sig.source || ""}<br>Comment: ${sig.comment || ""}`,
	align: "left",
	showarrow: false,
	xanchor: "left",
    bgcolor: "#ffe082",
    bordercolor: "#1976d2",
    font: { color: "#1976d2", size: 12 },
  }));

  // MA7, MA25, MA99 support
  const ma7 = calculateMA(data, 7);
  const ma25 = calculateMA(data, 25);
  const ma99 = calculateMA(data, 99);

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
				name: "CandleStick",
              },
              // MA7 line
              {
                x: data.map(d => new Date(d.timestamp)),
                y: ma7,
                type: "scatter",
                mode: "lines",
                name: "MA7",
                line: { color: "#f8b800", width: 1 },
              },
              // MA25 line
              {
                x: data.map(d => new Date(d.timestamp)),
                y: ma25,
                type: "scatter",
                mode: "lines",
                name: "MA25",
                line: { color: "#ce3f87", width: 1 },
              },
              // MA99 line
              {
                x: data.map(d => new Date(d.timestamp)),
                y: ma99,
                type: "scatter",
                mode: "lines",
                name: "MA99",
                line: { color: "#5155c7", width: 1 },
              },
            ]}
            layout={{
              ...layout,
              autosize: true,
              width: undefined,
              height: undefined,
			  shapes: shapes,
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
import React, { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CssBaseline,
  Box,
} from "@mui/material";

function App() {
  const [data, setData] = useState([]);
  const ws = useRef(null);

  // 转成echarts需要格式
  const getOption = () => ({
    title: {
      text: "实时股票K线图",
      left: "center",
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.time),
      axisLine: { onZero: false },
      splitLine: { show: false },
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true,
      },
    },
    series: [
      {
        name: "K线",
        type: "candlestick",
        data: data.map((item) => [
          item.open,
          item.close,
          item.low,
          item.high,
        ]),
        itemStyle: {
          color: "#0f0",
          color0: "#f00",
          borderColor: "#0a0",
          borderColor0: "#a00",
        },
      },
    ],
  });

  // 拉取历史K线数据
  useEffect(() => {
    fetch("http://localhost:8000/api/kline")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(console.error);
  }, []);

  // 建立WebSocket，实时更新
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/kline");
    ws.current.onmessage = (event) => {
      const newKline = JSON.parse(event.data);
      setData((prev) => [...prev.slice(-99), newKline]);
    };
    return () => ws.current.close();
  }, []);

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            股票K线图（Vite + React + MUI）
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ height: 500 }}>
          <ReactECharts option={getOption()} style={{ height: "100%" }} />
        </Box>
      </Container>
    </>
  );
}

export default App;

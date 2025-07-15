# backend/api/main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio

from chart.core import KlineGenerator

app = FastAPI()

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

kline_gen = KlineGenerator()

@app.get("/api/kline")
async def get_kline():
    data = kline_gen.generate_history()
    return {"data": data}

@app.websocket("/ws/kline")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        kline = kline_gen.generate_realtime()
        await websocket.send_json(kline)
        await asyncio.sleep(1)
app.mount("/", StaticFiles(directory="web", html=True), name="web")

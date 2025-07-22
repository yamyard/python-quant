import requests
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
import asyncio
import websockets
import json

from src.signal.core import SignalUnit
from src.signal.redis import save_signal, get_signal, delete_signal, RedisInstance

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境限制为前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clients = set()

BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"

# 新增接口：获取历史K线（默认最近50根）
@app.get("/api/kline")
def get_initial_kline(limit: int = 50):
    url = "https://api.binance.com/api/v3/klines"
    params = {"symbol": "BTCUSDT", "interval": "1m", "limit": limit}
    res = requests.get(url, params=params)
    raw = res.json()
    return [{
        "timestamp": item[0],
        "open": float(item[1]),
        "high": float(item[2]),
        "low": float(item[3]),
        "close": float(item[4]),
        "volume": float(item[5])
    } for item in raw]

# WebSocket 负责推送 Binance 实时K线数据
async def binance_ws_handler():
    async with websockets.connect(BINANCE_WS_URL) as binance_ws:
        print("✅ Connected to Binance WebSocket")
        async for message in binance_ws:
            msg = json.loads(message)
            k = msg['k']
            kline_data = {
                "timestamp": k['t'],
                "open": float(k['o']),
                "high": float(k['h']),
                "low": float(k['l']),
                "close": float(k['c']),
                "volume": float(k['v'])
            }
            await broadcast(json.dumps(kline_data))

async def broadcast(message: str):
    to_remove = set()
    for client in clients:
        try:
            await client.send_text(message)
        except:
            to_remove.add(client)
    for c in to_remove:
        clients.remove(c)

@app.websocket("/ws/kline")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # 保持连接
    except WebSocketDisconnect:
        clients.remove(websocket)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(binance_ws_handler())

# Signal相关接口

@app.post("/api/signal")
def api_save_signal(signal: dict = Body(...)):
    # signal 字段必须包含全部 SignalUnit 属性
    try:
        signal_unit = SignalUnit.from_dict(signal)
    except Exception as e:
        return {"error": f"Invalid SignalUnit data: {e}"}
    save_signal(signal_unit)
    return {"success": True, "id": signal_unit.id}

@app.get("/api/signal/{signal_id}")
def api_get_signal(signal_id: str):
    try:
        signal_unit = get_signal(signal_id)
    except Exception as e:
        return {"error": f"Signal not found: {e}"}
    return signal_unit.to_dict()

@app.delete("/api/signal/{signal_id}")
def api_delete_signal(signal_id: str):
    delete_signal(signal_id)
    return {"success": True, "id": signal_id}

@app.get("/api/signals")
def api_get_signals():
    # 扫描所有 SignalRedis:* 键
    keys = RedisInstance.keys("SignalRedis:*")
    signals = []
    for key in keys:
        signal_dict = RedisInstance.hgetall(key)
        # decode bytes
        signal_dict = {k.decode(): v.decode() for k, v in signal_dict.items()}
        try:
            signals.append(SignalUnit.from_dict(signal_dict).to_dict())
        except Exception:
            pass
    return signals

app.mount("/", StaticFiles(directory="web", html=True), name="web")
import asyncio
import json
import requests
import websockets

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# create a set of clients
clients = set()

BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@kline_1m"

# fetch kline historical data via Binace REST API
@router.get("/kline")
# default limit as 50
def get_initial_kline(limit: int = 50):
    url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol": "BTCUSDT",
        "interval": "1m",
        "limit": limit
    }
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

# client connection endpoint
@router.websocket("/ws/kline")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        clients.remove(websocket)

# fetch kline real time data via Binance WebSocket
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

# broadcast message to all connected WebSocket clients
async def broadcast(message: str):
    to_remove = set()
    for client in clients:
        try:
            await client.send_text(message)
        except:
            to_remove.add(client)
    for c in to_remove:
        clients.remove(c)

# support Binance WebSocket starup event
def start_ws_task():
    return asyncio.create_task(binance_ws_handler())

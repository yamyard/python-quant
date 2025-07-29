import asyncio
import json
import requests
import websockets

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse

router = APIRouter()

# create a set of clients
clients = set()

# Use a dict to keep symbol state
state = {
    "symbol": "BTCUSDT"
}

def get_ws_url(symbol: str) -> str:
    return f"wss://stream.binance.com:9443/ws/{symbol.lower()}@kline_1m"

BINANCE_WS_URL = get_ws_url(state["symbol"])


# fetch kline historical data via Binace REST API
@router.get("/kline")
# default limit as 200
def get_initial_kline(limit: int = 200):
    symbol = state.get("symbol", "BTCUSDT")
    url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol": symbol,
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

# add endpoint to set symbol
@router.post("/kline-symbol")
async def set_kline_symbol(request: Request):
    body = await request.json()
    symbol = body.get("symbol", "BTCUSDT").upper()
    # optionally, validate symbol format here
    state["symbol"] = symbol
    # restart the websocket handler if needed
    restart_ws_task()
    return JSONResponse(content={"symbol": symbol})

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

# # fetch kline real time data via Binance WebSocket, useing global state symbol and can be restarted
ws_task = None

async def binance_ws_handler():
    last_symbol = state["symbol"]
    ws_url = get_ws_url(last_symbol)
    while True:
        try:
            async with websockets.connect(ws_url) as binance_ws:
                print(f"✅ Connected to Binance WebSocket: {last_symbol}")
                async for message in binance_ws:
                    # if symbol changed, break and reconnect
                    if state["symbol"] != last_symbol:
                        print("🔄 Symbol changed, reconnecting WebSocket...")
                        break
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
                last_symbol = state["symbol"]
                ws_url = get_ws_url(last_symbol)
        except Exception as e:
            print("WebSocket error:", e)
            # retry delay
            await asyncio.sleep(3)

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

# support Binance WebSocket start event
def start_ws_task():
    global ws_task
    if ws_task is None or ws_task.done():
        ws_task = asyncio.create_task(binance_ws_handler())
    return ws_task

# support Binance WebSocket restart event
def restart_ws_task():
    global ws_task
    if ws_task:
        ws_task.cancel()
    ws_task = asyncio.create_task(binance_ws_handler())

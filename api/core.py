from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routers import kline, signal, account

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register routers
app.include_router(kline.router, prefix="/api", tags=["kline"])
app.include_router(signal.router, prefix="/api", tags=["signal"])
app.include_router(account.router, prefix="/api", tags=["account"]) 

# startup event
@app.on_event("startup")
async def startup_event():
    kline.start_ws_task()

# mount static frontend files
app.mount("/", StaticFiles(directory="web", html=True), name="web")

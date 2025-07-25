from fastapi import APIRouter, Body

from src.signal.core import SignalUnit
from src.signal.redis import save_signal, get_signal, delete_signal, RedisInstance

router = APIRouter()

# save signal to redis
@router.post("/signal")
def api_save_signal(signal: dict = Body(...)):
    try:
        signal_unit = SignalUnit.from_dict(signal)
    except Exception as e:
        return {"error": f"Invalid SignalUnit data: {e}"}
    save_signal(signal_unit)
    return {"success": True, "id": signal_unit.id}

# get a signal
@router.get("/signal/{signal_id}")
def api_get_signal(signal_id: str):
    try:
        signal_unit = get_signal(signal_id)
    except Exception as e:
        return {"error": f"Signal not found: {e}"}
    return signal_unit.to_dict()

# delete a signal
@router.delete("/signal/{signal_id}")
def api_delete_signal(signal_id: str):
    delete_signal(signal_id)
    return {"success": True, "id": signal_id}

# get all signal
@router.get("/signals")
def api_get_signals():
    keys = RedisInstance.keys("SignalRedis:*")
    signals = []
    for key in keys:
        signal_dict = RedisInstance.hgetall(key)
        signal_dict = {k.decode(): v.decode() for k, v in signal_dict.items()}
        try:
            signals.append(SignalUnit.from_dict(signal_dict).to_dict())
        except Exception:
            pass
    return signals

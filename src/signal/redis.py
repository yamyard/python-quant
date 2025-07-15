import redis
from .core import Signal

r = redis.Redis(host='localhost', port=6379, db=0)

def save_signal(signal: Signal):
    key = f"signal:{signal.id}"
    r.hmset(key, signal.to_dict())

def get_signal(signal_id: str) -> Signal:
    key = f"signal:{signal_id}"
    signal_dict = r.hgetall(key)
    # 解码 bytes 为 str
    signal_dict = {k.decode(): v.decode() for k, v in signal_dict.items()}
    return Signal.from_dict(signal_dict)

import redis
from .core import SignalUnit

r = redis.Redis(host='localhost', port=6379, db=0)

def save_signal(signal_input: SignalUnit):
    key = f"SignalRedis:{signal_input.id}"
    r.hset(key, mapping=signal_input.to_dict())

def get_signal(signal_id: str) -> SignalUnit:
    key = f"SignalRedis:{signal_id}"
    signal_dict = r.hgetall(key)
    signal_dict = {k.decode(): v.decode() for k, v in signal_dict.items()}
    return SignalUnit.from_dict(signal_dict)

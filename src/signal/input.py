from datetime import datetime, timedelta
from uuid import uuid4
import random
from .core import SignalUnit
from .redis import save_signal

def generate_fake_signal():
    now = datetime.utcnow()
    signal = SignalUnit(
        id=str(uuid4()),
        symbol="BTCUSDT",
        value=random.choice(["buy", "sell"]),
        timestamp=now.isoformat(),
        source=random.choice(["news", "price", "volume"]),
        comment="Auto-generated signal"
    )
    save_signal(signal)
    return signal

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from signal.core import SignalUnit
from signal.redis import save_signal, get_signal

i = SignalUnit(
    id="001",
    symbol="AAPL",
    value="buy",
    timestamp="2025-07-15 09:00:00",
    source="news",
    comment="some comment"
)
save_signal(i)

u = get_signal("001")
print(u)

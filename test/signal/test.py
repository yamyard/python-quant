import sys
import os

# 把 src 的绝对路径加入 sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../src')))

from signal.core import Signal
from signal.redis import save_signal, get_signal

signal = Signal(
    id="001",
    symbol="AAPL",
    value="buy",
    timestamp="2025-07-15 09:00:00",
    source="news",
    comment="说明文本"
)

save_signal(signal)
retrieved = get_signal("001")
print(retrieved)

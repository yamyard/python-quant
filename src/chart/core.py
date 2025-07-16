import random
from datetime import datetime, timedelta

class KlineGenerator:
    def __init__(self):
        self.price = 100.0

    def generate_history(self, count=100):
        base_time = datetime.now() - timedelta(minutes=count)
        data = []
        price = self.price
        for _ in range(count):
            open_ = price
            close = open_ + random.uniform(-1, 1)
            high = max(open_, close) + random.uniform(0, 0.5)
            low = min(open_, close) - random.uniform(0, 0.5)
            time = base_time.strftime("%Y-%m-%d %H:%M")
            data.append({
                "time": time,
                "open": round(open_, 2),
                "close": round(close, 2),
                "high": round(high, 2),
                "low": round(low, 2)
            })
            base_time += timedelta(minutes=1)
            price = close
        self.price = price
        return data

    def generate_realtime(self):
        open_ = self.price
        close = open_ + random.uniform(-1, 1)
        high = max(open_, close) + random.uniform(0, 0.5)
        low = min(open_, close) - random.uniform(0, 0.5)
        kline = {
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "open": round(open_, 2),
            "close": round(close, 2),
            "high": round(high, 2),
            "low": round(low, 2)
        }
        self.price = close
        return kline

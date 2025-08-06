from typing import Dict
from pydantic import BaseModel

class Account(BaseModel):
    user_id: str
    cash: float
    shares: Dict[str, int] = {}

    # basic manipulating
    def to_dict(self):
        return self.model_dump()
    @classmethod
    def from_dict(cls, d):
        return cls(**d)
    def to_json(self):
        return self.model_dump_json()
  
    # modify shares
    def add_shares(self, symbol: str, amount: int):
        self.shares[symbol] = self.shares.get(symbol, 0) + amount
    def remove_shares(self, symbol: str, amount: int):
        if symbol in self.shares:
            self.shares[symbol] -= amount
            if self.shares[symbol] <= 0:
                del self.shares[symbol]

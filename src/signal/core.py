from dataclasses import dataclass, asdict
import json

@dataclass
class SignalUnit:
    id: str
    symbol: str
    value: str
    timestamp: str
    source: str
    comment: str

    def to_dict(self):
        return asdict(self)

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    def to_json(self):
        return json.dumps(self.to_dict())
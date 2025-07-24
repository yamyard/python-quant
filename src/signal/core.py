from pydantic import BaseModel

class SignalUnit(BaseModel):
    id: str
    symbol: str
    value: str
    timestamp: str
    source: str
    comment: str

    def to_dict(self):
        return self.model_dump()

    @classmethod
    def from_dict(cls, d):
        return cls(**d)

    def to_json(self):
        return self.model_dump_json()

import redis
from .core import Account

RedisInstance = redis.Redis(host='localhost', port=6379, db=0)

def save_account(account: Account):
    key = f"AccountRedis:{account.user_id}"
    RedisInstance.hset(key, mapping=account.to_dict())

def get_account(user_id: str) -> Account:
    key = f"AccountRedis:{user_id}"
    account_dict = RedisInstance.hgetall(key)
    account_dict = {k.decode(): v.decode() for k, v in account_dict.items()}
    # shares are stored as a string, need to parse back to dict
    if "shares" in account_dict and isinstance(account_dict["shares"], str):
        import json
        account_dict["shares"] = json.loads(account_dict["shares"])
    return Account.from_dict(account_dict)

def delete_account(user_id: str):
    key = f"AccountRedis:{user_id}"
    RedisInstance.delete(key)

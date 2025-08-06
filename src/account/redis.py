import redis
import json
from .core import Account

RedisInstance = redis.Redis(host='localhost', port=6379, db=0)

def save_account(account: Account):
    key = f"AccountRedis:{account.user_id}"
    account_dict = account.to_dict()
    # 序列化 shares 字段为 JSON 字符串
    if "shares" in account_dict:
        account_dict["shares"] = json.dumps(account_dict["shares"])
    RedisInstance.hset(key, mapping=account_dict)

def get_account(user_id: str) -> Account:
    key = f"AccountRedis:{user_id}"
    account_dict = RedisInstance.hgetall(key)
    account_dict = {k.decode(): v.decode() for k, v in account_dict.items()}
    # shares are存储为 JSON字符串，需要反序列化
    if "shares" in account_dict and isinstance(account_dict["shares"], str):
        import json
        account_dict["shares"] = json.loads(account_dict["shares"])
    return Account.from_dict(account_dict)

def delete_account(user_id: str):
    key = f"AccountRedis:{user_id}"
    RedisInstance.delete(key)
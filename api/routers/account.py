from fastapi import APIRouter, Body

from src.account.core import Account
from src.account.redis import save_account, get_account, delete_account, RedisInstance

router = APIRouter()

# save account to redis
@router.post("/account")
def api_save_account(account: dict = Body(...)):
    try:
        account_unit = Account.from_dict(account)
    except Exception as e:
        return {"error": f"Invalid Account data: {e}"}
    save_account(account_unit)
    return {"success": True, "user_id": account_unit.user_id}

# get an account
@router.get("/account/{user_id}")
def api_get_account(user_id: str):
    try:
        account_unit = get_account(user_id)
    except Exception as e:
        return {"error": f"Account not found: {e}"}
    return account_unit.to_dict()

# delete an account
@router.delete("/account/{user_id}")
def api_delete_account(user_id: str):
    delete_account(user_id)
    return {"success": True, "user_id": user_id}

# get all accounts
@router.get("/accounts")
def api_get_accounts():
    keys = RedisInstance.keys("AccountRedis:*")
    accounts = []
    for key in keys:
        account_dict = RedisInstance.hgetall(key)
        account_dict = {k.decode(): v.decode() for k, v in account_dict.items()}
        try:
            # shares field might be stored as a string, so parse it
            if "shares" in account_dict and isinstance(account_dict["shares"], str):
                import json
                account_dict["shares"] = json.loads(account_dict["shares"])
            accounts.append(Account.from_dict(account_dict).to_dict())
        except Exception:
            pass
    return accounts

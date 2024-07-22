import json
from requests import request


class Event:
    def emit(user_receivers_id, data):
        res = request(method="POST", url="http://localhost:3000", data=json.dumps({
            "id": user_receivers_id,
            "data": data
        }))
        print(res)
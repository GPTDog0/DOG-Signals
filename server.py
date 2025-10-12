from fastapi import FastAPI
from pydantic import BaseModel
import json
import os

app = FastAPI()

DATA_FILE = "approved.json"

# Загружаем список одобренных пользователей
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as f:
        approved_users = set(json.load(f))
else:
    approved_users = set()

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/check/{user_id}")
def check_user(user_id: str):
    if user_id in approved_users:
        return {"approved": True}
    return {"approved": False}

@app.post("/approve/{user_id}")
def approve_user(user_id: str):
    approved_users.add(user_id)
    with open(DATA_FILE, "w") as f:
        json.dump(list(approved_users), f)
    return {"status": "approved", "user_id": user_id}

@app.post("/decline/{user_id}")
def decline_user(user_id: str):
    approved_users.discard(user_id)
    with open(DATA_FILE, "w") as f:
        json.dump(list(approved_users), f)
    return {"status": "declined", "user_id": user_id}

import requests

BASE = "http://127.0.0.1:8000"
r = requests.post(f"{BASE}/auth/login", json={"email": "aarav@example.com", "password": "Password123"})
h = {"Authorization": f"Bearer {r.json()['access_token']}"}

r = requests.get(f"{BASE}/posts/6/comments", headers=h)
data = r.json()
print("LIST:", r.status_code, "| top-level:", len(data), "| first has", len(data[0]["replies"]), "replies")

first = data[0]["id"]
r = requests.post(f"{BASE}/posts/6/comments", headers=h, json={"text": "Test reply", "parent_id": first})
print("REPLY:", r.status_code, "| parent_id:", r.json()["parent_id"])

r = requests.post(f"{BASE}/posts/6/comments", headers=h, json={"text": "   "})
print("EMPTY TEXT:", r.status_code)

r = requests.post(f"{BASE}/comments/{first}/like", headers=h)
print("LIKE:", r.status_code, r.json())
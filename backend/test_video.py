import requests

BASE = "http://127.0.0.1:8000"

r = requests.post(f"{BASE}/auth/login", json={"email": "aarav@example.com", "password": "Password123"})
headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

r = requests.get(f"{BASE}/posts/6", headers=headers)
p = r.json()
print("POST 6:", r.status_code, "| likes", p["like_count"], "| comments", p["comment_count"], "| shares", p["share_count"])

r = requests.post(f"{BASE}/posts/6/share", headers=headers)
print("SHARE:", r.status_code, r.json())

r = requests.get(f"{BASE}/posts/999", headers=headers)
print("MISSING POST:", r.status_code)
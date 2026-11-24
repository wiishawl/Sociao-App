import requests

BASE = "http://127.0.0.1:8000"
r = requests.post(f"{BASE}/auth/login", json={"email": "aarav@example.com", "password": "Password123"})
h = {"Authorization": f"Bearer {r.json()['access_token']}"}

followers = requests.get(f"{BASE}/users/me/followers", headers=h).json()
print("FOLLOWERS:", [u["username"] for u in followers])

following = requests.get(f"{BASE}/users/me/following", headers=h).json()
print("FOLLOWING:", [u["username"] for u in following])

found = requests.get(f"{BASE}/users/me/followers?q=SAR", headers=h).json()
print("SEARCH 'SAR':", [u["username"] for u in found])

r = requests.delete(f"{BASE}/users/me/followers/2", headers=h)
print("REMOVE NON-FOLLOWER:", r.status_code)
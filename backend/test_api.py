import requests

BASE = "http://127.0.0.1:8000"

# 1. Log in
r = requests.post(f"{BASE}/auth/login", json={"email": "aarav@example.com", "password": "Password123"})
print("LOGIN status:", r.status_code)
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Read the feed
r = requests.get(f"{BASE}/posts", headers=headers)
print("FEED status:", r.status_code)
post1 = [p for p in r.json() if p["id"] == 1][0]
print("Post 1 before: likes =", post1["like_count"], "| liked by me =", post1["liked_by_me"])

# 3. Like post 1
r = requests.post(f"{BASE}/posts/1/like", headers=headers)
print("LIKE:", r.status_code, r.json())

# 4. Like again (should undo)
r = requests.post(f"{BASE}/posts/1/like", headers=headers)
print("LIKE again:", r.status_code, r.json())

# 5. Feed without a token (should be blocked)
r = requests.get(f"{BASE}/posts")
print("FEED without token:", r.status_code)
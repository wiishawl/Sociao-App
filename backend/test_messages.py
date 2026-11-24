import requests

BASE = "http://127.0.0.1:8000"
r = requests.post(f"{BASE}/auth/login", json={"email": "aarav@example.com", "password": "Password123"})
h = {"Authorization": f"Bearer {r.json()['access_token']}"}

inbox = requests.get(f"{BASE}/conversations", headers=h).json()
r = requests.get(f"{BASE}/conversations", headers=h)
print("INBOX STATUS:", r.status_code)
print("INBOX BODY:", r.text[:300])
inbox = r.json()
for c in inbox:
    print("INBOX:", c["user"]["username"], "|", c["last_message"], "| unread", c["unread_count"])

cid = inbox[0]["id"]
r = requests.get(f"{BASE}/conversations/{cid}/messages", headers=h)
print("THREAD:", r.status_code, "|", len(r.json()["messages"]), "messages")

r = requests.post(f"{BASE}/conversations/{cid}/read", headers=h)
print("READ:", r.status_code)

r = requests.post(f"{BASE}/conversations/{cid}/messages", headers=h, json={"text": "Test message"})
print("SEND:", r.status_code)

r = requests.post(f"{BASE}/conversations/4/messages", headers=h, json={"text": "Not mine"})
print("NOT MY CHAT:", r.status_code)
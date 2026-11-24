import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { timeAgo } from "../timeAgo";

export default function Inbox() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [error, setError] = useState("");

  async function load() {
    setStatus("loading");
    try {
      setItems(await api("/conversations"));
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <header className="topbar">
        <h2>Messages</h2>
      </header>

      {status === "loading" && <p className="center muted">Loading conversations...</p>}

      {status === "error" && (
        <div className="center">
          <p className="error">{error}</p>
          <button className="btn" onClick={load}>Try again</button>
        </div>
      )}

      {status === "ready" && items.length === 0 && (
        <p className="center muted">No conversations yet.</p>
      )}

      {status === "ready" &&
        items.map((c) => (
          <button key={c.id} className="convo" onClick={() => navigate(`/chat/${c.id}`)}>
            <img className="avatar" src={c.user.avatar_url} alt="" />
            <div className="grow convo-text">
              <strong>{c.user.full_name}</strong>
              <div className={c.unread_count > 0 ? "preview unread" : "preview"}>
                {c.last_message || "No messages yet"}
              </div>
            </div>
            <div className="convo-meta">
              <span className="small muted">
                {c.last_message_at ? timeAgo(c.last_message_at) : ""}
              </span>
              {c.unread_count > 0 && <span className="dot" aria-label="Unread" />}
            </div>
          </button>
        ))}
    </div>
  );
}
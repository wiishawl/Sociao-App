import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getUser } from "../api";

function clock(iso) {
  // The backend sends UTC times without a "Z", so add it before parsing
  const date = new Date(/Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + "Z");
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = getUser();
  const endRef = useRef(null);
  const [thread, setThread] = useState(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    let active = true;
    api(`/conversations/${id}/messages`)
      .then(async (data) => {
        if (!active) return;
        setThread(data);
        // Opening the chat marks the other person's messages as read
        await api(`/conversations/${id}/read`, { method: "POST" });
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const count = thread ? thread.messages.length : 0;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [count]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const message = await api(`/conversations/${id}/messages`, {
        method: "POST",
        body: { text },
      });
      setThread((t) => ({ ...t, messages: [...t.messages, message] }));
      setText("");
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function heart(messageId) {
    try {
      const res = await api(`/messages/${messageId}/heart`, { method: "POST" });
      setThread((t) => ({
        ...t,
        messages: t.messages.map((m) => (m.id === messageId ? { ...m, hearted: res.hearted } : m)),
      }));
    } catch {
      // leave the message unchanged if the request fails
    }
  }

  if (error) {
    return (
      <div className="chat">
        <div className="chat-head">
          <button className="icon-btn" onClick={() => navigate("/inbox")} aria-label="Back">←</button>
        </div>
        <p className="center error">{error}</p>
      </div>
    );
  }

  if (!thread) return <p className="center muted">Loading chat...</p>;

  return (
    <div className="chat">
      <div className="chat-head">
        <button className="icon-btn" onClick={() => navigate("/inbox")} aria-label="Back">←</button>
        <img className="avatar" src={thread.user.avatar_url} alt="" />
        <div className="grow">
          <strong>{thread.user.full_name}</strong>
          <div className="muted small">@{thread.user.username}</div>
        </div>
        <button className="icon-btn" disabled title="Calls are not part of this build">📞</button>
        <button className="icon-btn" disabled title="Video calls are not part of this build">🎥</button>
      </div>

      <div className="chat-body">
        {thread.messages.length === 0 && (
          <p className="center muted">No messages yet. Say hello!</p>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={m.sender_id === me?.id ? "msg mine" : "msg theirs"}>
            <div className="bubble">{m.text}</div>
            <div className="meta small muted">
              {clock(m.created_at)}
              <button className="heart-btn" onClick={() => heart(m.id)} aria-label="Heart reaction">
                {m.hearted ? "♥" : "♡"}
              </button>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form className="chat-input" onSubmit={send}>
        <input
          placeholder="Message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
        />
        <button className="link" disabled={!text.trim() || sending}>Send</button>
      </form>
      {sendError && <p className="error center">{sendError}</p>}
    </div>
  );
}
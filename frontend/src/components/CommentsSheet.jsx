import { useEffect, useState } from "react";
import { api } from "../api";
import { timeAgo } from "../timeAgo";
import { createPortal } from "react-dom";

function Row({ c, isReply, onLike, onReply }) {
  return (
    <div className={isReply ? "comment reply" : "comment"}>
      <img className="avatar small-avatar" src={c.author.avatar_url} alt="" />
      <div className="grow">
        <div>
          <strong>@{c.author.username}</strong>{" "}
          <span className="muted small">{timeAgo(c.created_at)}</span>
        </div>
        <div className="comment-text">{c.text}</div>
        <button className="link small" onClick={() => onReply(c)}>Reply</button>
      </div>
      <button className="icon-btn like-col" onClick={() => onLike(c.id)}>
        {c.liked_by_me ? "♥" : "♡"}
        <span className="small">{c.like_count}</span>
      </button>
    </div>
  );
}

export default function CommentsSheet({ postId, onClose, onTotalChange }) {
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { id, username }
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const total = comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);

  async function load() {
    setStatus("loading");
    try {
      setComments(await api(`/posts/${postId}/comments`));
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, [postId]);

  // Keep the viewer's comment count in step with what the sheet shows
  useEffect(() => {
    if (status === "ready") onTotalChange(total);
  }, [total, status]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setSendError("");
    try {
      const created = await api(`/posts/${postId}/comments`, {
        method: "POST",
        body: { text, parent_id: replyTo ? replyTo.id : null },
      });
      setComments((list) =>
        created.parent_id === null
          ? [created, ...list]
          : list.map((c) =>
              c.id === created.parent_id ? { ...c, replies: [...c.replies, created] } : c
            )
      );
      setText("");
      setReplyTo(null);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function like(id) {
    try {
      const res = await api(`/comments/${id}/like`, { method: "POST" });
      const patch = (c) =>
        c.id === id ? { ...c, liked_by_me: res.liked, like_count: res.like_count } : c;
      setComments((list) => list.map((c) => ({ ...patch(c), replies: c.replies.map(patch) })));
    } catch {
      // leave the comment unchanged if the request fails
    }
  }

  function startReply(c) {
    setReplyTo({ id: c.id, username: c.author.username });
  }

    return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <strong>{status === "ready" ? `${total} comments` : "Comments"}</strong>
          <button className="icon-btn" onClick={onClose} aria-label="Close comments">✕</button>
        </div>

        <div className="sheet-body">
          {status === "loading" && <p className="center muted">Loading comments...</p>}
          {status === "error" && (
            <div className="center">
              <p className="error">{error}</p>
              <button className="btn" onClick={load}>Try again</button>
            </div>
          )}
          {status === "ready" && comments.length === 0 && (
            <p className="center muted">No comments yet. Start the conversation.</p>
          )}
          {status === "ready" &&
            comments.map((c) => (
              <div key={c.id}>
                <Row c={c} onLike={like} onReply={startReply} />
                {c.replies.map((r) => (
                  <Row key={r.id} c={r} isReply onLike={like} onReply={startReply} />
                ))}
              </div>
            ))}
        </div>

        <form className="sheet-input" onSubmit={send}>
          {replyTo && (
            <div className="reply-chip">
              Replying to @{replyTo.username}
              <button type="button" className="link" onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
          {sendError && <p className="error">{sendError}</p>}
          <div className="input-row">
            <input
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
            />
            <button className="link" disabled={!text.trim() || sending}>Post</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
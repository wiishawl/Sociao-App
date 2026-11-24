import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function People({ kind }) {
  const navigate = useNavigate();
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("loading"); // loading | error | ready
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const isFollowers = kind === "followers";

  useEffect(() => {
    let active = true;
    // Wait 300ms after the last keystroke so we don't search on every letter
    const timer = setTimeout(
      () => {
        api(`/users/me/${kind}?q=${encodeURIComponent(query)}`)
          .then((list) => {
            if (!active) return;
            setPeople(list);
            setStatus("ready");
          })
          .catch((err) => {
            if (!active) return;
            setError(err.message);
            setStatus("error");
          });
      },
      query ? 300 : 0
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [kind, query]);

  async function message(userId) {
    setActionError("");
    try {
      const res = await api("/conversations", { method: "POST", body: { user_id: userId } });
      navigate(`/chat/${res.id}`);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function remove(userId) {
    if (!window.confirm("Remove this follower?")) return;
    setActionError("");
    setBusyId(userId);
    try {
      await api(`/users/me/followers/${userId}`, { method: "DELETE" });
      setPeople((list) => list.filter((p) => p.id !== userId));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="people-head">
        <button className="icon-btn" onClick={() => navigate("/profile")} aria-label="Back to profile">←</button>
        <h2>{isFollowers ? "Followers" : "Following"}</h2>
      </div>

      <input
        className="search"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {actionError && <p className="error center">{actionError}</p>}

      {status === "loading" && <p className="center muted">Loading...</p>}
      {status === "error" && <p className="error center">{error}</p>}

      {status === "ready" && people.length === 0 && (
        <p className="center muted">
          {query
            ? `No results for "${query}".`
            : isFollowers
            ? "No followers yet."
            : "You're not following anyone yet."}
        </p>
      )}

      {status === "ready" &&
        people.map((p) => (
          <div className="person" key={p.id}>
            <img className="avatar" src={p.avatar_url} alt="" />
            <div className="grow">
              <strong>{p.full_name}</strong>
              <div className="muted small">@{p.username}</div>
            </div>
            <div className="person-actions">
              <button className="pill" onClick={() => message(p.id)}>Message</button>
              {isFollowers && (
                <button className="pill danger" onClick={() => remove(p.id)} disabled={busyId === p.id}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
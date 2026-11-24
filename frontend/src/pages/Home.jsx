
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearSession } from "../api";
import PostCard from "../components/PostCard";

function Icon({ name, size = 21 }) {
  const paths = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></>,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
    video: <><path d="M4 5.5 12 2l8 3.5v13L12 22l-8-3.5z"/><path d="m10 9 5 3-5 3z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    inbox: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 10h8M8 14h5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  async function loadFeed() {
    setStatus("loading");
    setError("");

    try {
      const data = await api("/posts");
      setPosts(data);
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {}
    clearSession();
    navigate("/login", { replace: true });
  }

  function patchPost(id, changes) {
    setPosts(list =>
      list.map(p => p.id === id ? { ...p, ...changes } : p)
    );
  }

  const stories = [
    ...new Map(
      posts
        .filter(p => p.author?.id)
        .map(p => [p.author.id, p.author])
    ).values()
  ];

  return (
    <div className="social-page">

      <header className="social-header">
        <h1>Sociao</h1>

        <div className="header-actions">
          <button aria-label="Notifications">
            <Icon name="bell" />
          </button>
          <button aria-label="Messages" onClick={() => navigate("/inbox")}>
            <Icon name="message" />
          </button>
          <button aria-label="Log out" onClick={logout}>
            <Icon name="logout" />
          </button>
        </div>
      </header>

      <section className="stories-section">
        <div className="stories-list">

          <button className="story-item" onClick={() => navigate("/create")}>
            <div className="add-story-circle">
              <Icon name="plus" size={30} />
            </div>
            <span>Add Story</span>
          </button>

          {stories.map((person, index) => (
            <button className="story-item" key={person.id}>
              <div className={`story-ring ring-${index % 3}`}>
                <img
                  src={person.avatar_url || "/default-avatar.png"}
                  alt=""
                />
              </div>
              <span>{person.username || person.full_name || "User"}</span>
            </button>
          ))}

        </div>
      </section>

      <main className="social-feed">

        {status === "loading" && (
          <p className="feed-message">Loading your feed...</p>
        )}

        {status === "error" && (
          <div className="feed-message">
            <p>{error}</p>
            <button onClick={loadFeed}>Try again</button>
          </div>
        )}

        {status === "ready" && posts.length === 0 && (
          <div className="empty-feed">
            <h3>Your feed is empty</h3>
            <p>Share something with your friends.</p>
            <button onClick={() => navigate("/create")}>
              Create a post
            </button>
          </div>
        )}

        {status === "ready" && posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onChange={patchPost}
          />
        ))}

      </main>
    </div>
  );
}

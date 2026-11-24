import { useEffect, useState } from "react";
import { api } from "../api";
import PostCard from "../components/PostCard";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";


export default function Profile() {
  const navigate = useNavigate();  
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState(location.state?.tab || "posts");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");


  async function load() {
    setStatus("loading");
    try {
      const [p, list] = await Promise.all([api("/users/me"), api("/users/me/posts")]);
      setProfile(p);
      setPosts(list);
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function patchPost(id, changes) {
    setPosts((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  if (status === "loading") return <p className="center muted">Loading profile...</p>;
  if (status === "error")
    return (
      <div className="center">
        <p className="error">{error}</p>
        <button className="btn" onClick={load}>Try again</button>
      </div>
    );

  const videos = posts.filter((p) => p.media_type === "video");

  return (
    <div>
      <div className="gear-row">
        <button className="icon-btn" onClick={() => navigate("/settings")} aria-label="Settings">⚙</button>
    </div>  
      <div className="profile-head">
        <img className="avatar big" src={profile.avatar_url} alt="" />
        <h2>{profile.full_name}</h2>
        <div className="muted">@{profile.username}</div>
        {profile.bio && <p className="bio">{profile.bio}</p>}
        <button className="pill" onClick={() => navigate("/edit-profile")}>Edit profile</button>
        <div className="stats">
            <button className="stat" onClick={() => navigate("/following")}>
                <strong>{profile.following_count}</strong>
                <span>Following</span>
            </button>
             <button className="stat" onClick={() => navigate("/followers")}>
                <strong>{profile.followers_count}</strong>
                <span>Followers</span>
            </button>
            <div className="stat">
                <strong>{profile.posts_count}</strong>
                <span>Posts</span>
            </div>
        </div>
      </div>

      <div className="tabs">
        {[["posts", "Post"], ["videos", "Video"], ["tags", "Tag"]].map(([key, label]) => (
          <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "posts" &&
        (posts.length === 0 ? (
          <p className="center muted">You haven't posted anything yet.</p>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onChange={patchPost} />)
        ))}

      {tab === "videos" &&
        (videos.length === 0 ? (
          <p className="center muted">No videos yet.</p>
        ) : (
          <div className="video-grid">
            {videos.map((v) => (
  <div
    className="video-tile"
    key={v.id}
    onClick={() =>
      navigate(`/video/${v.id}`, {
        state: {
          from: "/profile",
          tab: "videos"
        }
      })
    }
  >
    <video src={v.media_url} preload="metadata" muted />
    <span className="views">▶ {v.view_count}</span>
  </div>
))}
          </div>
        ))}

      {tab === "tags" && <p className="center muted">No tagged posts yet.</p>}
    </div>
  );
}
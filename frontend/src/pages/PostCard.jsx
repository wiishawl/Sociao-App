
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function PostCard({ post, onChange }) {
  const navigate = useNavigate();
  const [liking, setLiking] = useState(false);
  const [error, setError] = useState("");

  async function toggleLike() {
    if (liking) return;

    setLiking(true);
    setError("");

    try {
      const result = await api(`/posts/${post.id}/like`, {
        method: "POST",
      });

      onChange(post.id, {
        liked_by_me: result.liked,
        like_count: result.like_count,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          className="avatar"
          src={post.author?.avatar_url || post.avatar_url || "/default-avatar.png"}
          alt=""
        />

        <div>
          <strong>{post.author?.full_name || post.full_name || post.username}</strong>
          <div className="muted">
            @{post.author?.username || post.username}
          </div>
        </div>
      </div>

      {(post.text || post.caption) && (
        <p className="post-caption">{post.text || post.caption}</p>
      )}

      {post.media_type === "video" && post.media_url ? (
        <div
          className="post-video-preview"
          onClick={() =>
            navigate(`/video/${post.id}`, {
              state: { from: "/" },
            })
          }
        >
          <video
            className="post-media"
            src={post.media_url}
            preload="metadata"
            muted
          />
          <span className="play">▶</span>
        </div>
      ) : post.media_url ? (
        <img
          className="post-media"
          src={post.media_url}
          alt="Post"
        />
      ) : null}

      <div className="post-actions">
        <button
          className="btn"
          onClick={toggleLike}
          disabled={liking}
        >
          {post.liked_by_me ? "♥ Liked" : "♡ Like"} ({post.like_count || 0})
        </button>

        <span className="muted">
          {post.view_count || 0} views
        </span>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

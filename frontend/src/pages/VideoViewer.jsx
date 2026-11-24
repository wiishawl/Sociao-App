
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import CommentsSheet from "../components/CommentsSheet";

export default function VideoViewer() {
  const [showComments, setShowComments] = useState(false);  
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [busy, setBusy] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    let active = true;

    setPost(null);
    setError("");

    api(`/posts/${id}`)
      .then((data) => {
        if (active) setPost(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [id]);

  function close() {
    const from = location.state?.from;

    if (from === "/profile") {
      navigate("/profile", {
        state: { tab: "videos" },
        replace: true,
      });
    } else if (from === "/") {
      navigate("/", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }

  async function act(kind) {
    if (busy) return;

    setBusy(true);
    setShareMessage("");

    try {
      const result = await api(`/posts/${id}/${kind}`, {
        method: "POST",
      });

      if (kind === "like") {
        setPost((p) => ({
          ...p,
          liked_by_me: result.liked,
          like_count: result.like_count,
        }));
      }

      if (kind === "save") {
        setPost((p) => ({
          ...p,
          saved_by_me: result.saved,
        }));
      }

      if (kind === "share") {
        setPost((p) => ({
          ...p,
          share_count: result.share_count,
        }));

        try {
          await navigator.clipboard.writeText(window.location.href);
          setShareMessage("Link copied!");
        } catch {
          setShareMessage("Share count updated. Copy the URL from your browser.");
        }
      }
    } catch (err) {
      setShareMessage(err.message || "Action failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (error || (post && (post.media_type !== "video" || !post.media_url))) {
    return (
      <div className="viewer">
        <button className="close" onClick={close} aria-label="Close">
          ✕
        </button>
        <p className="center">
          {error || "This post has no video."}
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="viewer">
        <button className="close" onClick={close} aria-label="Close">
          ✕
        </button>
        <p className="center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="viewer">
      <video
        ref={videoRef}
        src={post.media_url}
        autoPlay
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <button className="close" onClick={close} aria-label="Close">
        ✕
      </button>

      <button
        className="mute"
        onClick={() => setMuted((value) => !value)}
        aria-label="Toggle sound"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {!playing && (
        <button className="pause-indicator" onClick={togglePlay}>
          ▶
        </button>
      )}

      <div className="rail">
        <button onClick={() => act("like")} disabled={busy}>
          {post.liked_by_me ? "♥" : "♡"}
          <span>{post.like_count}</span>
        </button>

        <button onClick={() => setShowComments(true)}>
  💬        <span>{post.comment_count}</span>
        </button>

        <button onClick={() => act("share")} disabled={busy}>
          ↗
          <span>{post.share_count}</span>
        </button>

        <button onClick={() => act("save")} disabled={busy}>
          {post.saved_by_me ? "★" : "☆"}
          <span>{post.saved_by_me ? "Saved" : "Save"}</span>
        </button>
      </div>

      <div className="info">
        <div className="who">
          <img
            className="avatar"
            src={post.author?.avatar_url || "/default-avatar.png"}
            alt=""
          />
          <strong>@{post.author?.username}</strong>
        </div>

        <p>{post.text}</p>

        {post.music && (
          <p className="music">♪ {post.music}</p>
        )}

        {shareMessage && (
          <p className="share-message">{shareMessage}</p>
        )}
      </div>
      {showComments && (
  <CommentsSheet
    postId={id}
    onClose={() => setShowComments(false)}
    onTotalChange={(n) => setPost((p) => ({ ...p, comment_count: n }))}/>
)}
    </div>
  );
}

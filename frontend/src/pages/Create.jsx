import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, uploadFile } from "../api";

const TYPES = [
  ["text", "Text"],
  ["image", "Image"],
  ["video", "Video"],
];

export default function Create() {
  const navigate = useNavigate();
  const [type, setType] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState(""); // filled by the upload, never typed
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const valid = type === "text" ? text.trim().length > 0 : url !== "";

  async function pickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadFile(file);
      setType(result.media_type);
      setUrl(result.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!valid || posting || uploading) return;
    setPosting(true);
    setError("");
    try {
      await api("/posts", {
        method: "POST",
        body: {
          text,
          media_type: type,
          media_url: type === "text" ? null : url,
        },
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <form className="create" onSubmit={submit}>
      <div className="create-head">
        <button type="button" className="link" onClick={() => navigate(-1)}>Cancel</button>
        <strong>New post</strong>
        <button className="link" disabled={!valid || posting || uploading}>
          {posting ? "Posting..." : "Post"}
        </button>
      </div>

      <div className="tabs">
        {TYPES.map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={type === key ? "active" : ""}
            onClick={() => {
              setType(key);
              setUrl("");
              setError("");
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        placeholder={type === "text" ? "What's on your mind?" : "Write a caption (optional)"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
        rows={5}
      />

      {type !== "text" && (
        <label className="file-pick">
          {uploading
            ? "Uploading..."
            : url
            ? `Change ${type}`
            : `Choose ${type} from your device`}
          <input
            type="file"
            accept={type === "image" ? "image/*" : "video/*"}
            onChange={pickFile}
            disabled={uploading}
            hidden
          />
        </label>
      )}

      {type === "image" && url && <img className="create-preview" src={url} alt="Preview" />}
      {type === "video" && url && (
        <video className="create-preview" src={url} controls muted preload="metadata" />
      )}

      {type !== "text" && url && (
        <button type="button" className="link" onClick={() => setUrl("")}>
          Remove {type}
        </button>
      )}


      {error && <p className="error">{error}</p>}
    </form>
  );
}
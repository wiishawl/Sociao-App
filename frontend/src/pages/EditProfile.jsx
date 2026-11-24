import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken, getUser, setSession, uploadFile } from "../api";

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api("/users/me")
      .then((p) =>
        setForm({
          full_name: p.full_name,
          username: p.username,
          bio: p.bio || "",
          website: p.website || "",
          avatar_url: p.avatar_url,
        })
      )
      .catch((err) => setError(err.message));
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const result = await uploadFile(file);
      if (result.media_type !== "image") throw new Error("Please choose an image.");
      set("avatar_url", result.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const valid =
    form &&
    form.full_name.trim().length >= 2 &&
    /^[A-Za-z0-9_.]{3,30}$/.test(form.username.trim()) &&
    (form.website.trim() === "" || /^https?:\/\/\S+/i.test(form.website.trim()));

  async function save(e) {
    e.preventDefault();
    if (!valid || saving || uploading) return;
    setSaving(true);
    setError("");
    try {
      const updated = await api("/users/me", { method: "PATCH", body: form });
      // Keep the locally stored copy of the user in step with the server
      setSession(getToken(), { ...getUser(), ...updated });
      navigate("/profile", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return error ? <p className="center error">{error}</p> : <p className="center muted">Loading...</p>;
  }

  return (
    <form className="edit" onSubmit={save}>
      <div className="create-head">
        <button type="button" className="link" onClick={() => navigate("/profile")}>Cancel</button>
        <strong>Edit profile</strong>
        <button className="link" disabled={!valid || saving || uploading}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="edit-photo">
        <img className="avatar" src={form.avatar_url} alt="" />
        <label className="link">
          {uploading ? "Uploading..." : "Change photo"}
          <input type="file" accept="image/*" onChange={pickPhoto} disabled={uploading} hidden />
        </label>
      </div>

      <label className="field">Name</label>
      <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} maxLength={100} />

      <label className="field">Username</label>
      <input value={form.username} onChange={(e) => set("username", e.target.value)} maxLength={30} />

      <label className="field">Bio</label>
      <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={160} rows={3} />
      <span className="counter">{form.bio.length}/160</span>

      <label className="field">Website</label>
      <input
        placeholder="https://"
        value={form.website}
        onChange={(e) => set("website", e.target.value)}
        maxLength={255}
      />

      {error && <p className="error">{error}</p>}
    </form>
  );
}
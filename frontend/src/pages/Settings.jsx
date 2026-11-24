import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearSession } from "../api";
import { getLanguage, getTheme, setLanguage, setTheme } from "../theme";

export default function Settings() {
  const navigate = useNavigate();
  const [theme, setThemeState] = useState(getTheme());
  const [language, setLanguageState] = useState(getLanguage());

  function chooseTheme(value) {
    setTheme(value);
    setThemeState(value);
  }

  function chooseLanguage(e) {
    setLanguage(e.target.value);
    setLanguageState(e.target.value);
  }

  async function signOut() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // still clear the local session
    }
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <div className="people-head">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h2>Settings</h2>
      </div>

      <button className="row" onClick={() => navigate("/edit-profile")}>
        <span>Edit profile</span>
        <span>›</span>
      </button>

      <button className="row" onClick={() => navigate("/notifications")}>
        <span>Notifications</span>
        <span>›</span>
      </button>

      <div className="row static">
        <span>Appearance</span>
        <div className="seg">
          <button className={theme === "light" ? "active" : ""} onClick={() => chooseTheme("light")}>
            Light
          </button>
          <button className={theme === "dark" ? "active" : ""} onClick={() => chooseTheme("dark")}>
            Dark
          </button>
        </div>
      </div>

      <div className="row static">
        <span>Language</span>
        <select value={language} onChange={chooseLanguage}>
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="es">Español</option>
        </select>
      </div>
      <p className="settings-note">Your language choice is saved, but translations aren't built yet.</p>

      <a className="row" href="mailto:support@sociao.example?subject=Sociao%20support">
        <span>Help &amp; Support</span>
        <span>›</span>
      </a>

      <button className="row danger" onClick={signOut}>Sign out</button>
    </div>
  );
}
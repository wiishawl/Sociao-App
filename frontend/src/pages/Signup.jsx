import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setSession } from "../api";

const emailOk = (v) => /^\S+@\S+\.\S+$/.test(v);
const passwordOk = (v) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = fullName.trim().length >= 2 && emailOk(email) && passwordOk(password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/signup", {
        method: "POST",
        body: { full_name: fullName, email, password },
      });
      setSession(data.access_token, data.user); // signing up logs the user in
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="page" onSubmit={handleSubmit}>
      <h1>Create Account</h1>
      <p className="muted">Join Sociao to share, connect, and discover.</p>

      <label>Full name</label>
      <input
        placeholder="Your name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <label>Email</label>
      <input
        type="email"
        placeholder="name@gmail.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <div className="pw">
        <input
          type={show ? "text" : "password"}
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" className="link" onClick={() => setShow(!show)}>
          {show ? "Hide" : "Show"}
        </button>
      </div>
      <p className={password && !passwordOk(password) ? "hint bad" : "hint"}>
        At least 8 characters, with a letter and a number.
      </p>

      {error && <p className="error">{error}</p>}

      <button className="btn" disabled={!valid || loading}>
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="center">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
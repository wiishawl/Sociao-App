import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setSession } from "../api";

const emailOk = (v) => /^\S+@\S+\.\S+$/.test(v);

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = emailOk(email) && password.length >= 8;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: { email, password } });
      setSession(data.access_token, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="page" onSubmit={handleSubmit}>
      <h1>Welcome Back!</h1>
      <p className="muted">Log in to continue sharing, connecting, and discovering.</p>

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
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" className="link" onClick={() => setShow(!show)}>
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <button className="btn" disabled={!valid || loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="center">
        New here? <Link to="/signup">Create account</Link>
      </p>
    </form>
  );
}
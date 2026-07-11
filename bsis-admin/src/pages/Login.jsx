import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errMsg } from "../api/client";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div className="brand" style={{ borderBottom: 0, padding: 0 }}>
          <div className="brand-mark">BS</div>
          <div>
            <div className="brand-name">BSIS CMS</div>
            <div className="brand-sub">Bharat Startup &amp; Innovation Society</div>
          </div>
        </div>
        <div>
          <h2>Every page, event and story on bsis.in — managed from one place.</h2>
          <p>
            Edit pages section by section, publish news and events, curate your team
            and partners, and answer enquiries. Changes go live the moment you publish.
          </p>
        </div>
        <p style={{ fontSize: 12, color: "#6a7896", margin: 0 }}>
          © {new Date().getFullYear()} Bharat Startup and Innovation Society
        </p>
      </div>

      <div className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <h1>Sign in</h1>
          <p>Use the admin or editor account created for you.</p>

          {error && <div className="login-error">{error}</div>}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              placeholder="admin@bsis.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", padding: "10px" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

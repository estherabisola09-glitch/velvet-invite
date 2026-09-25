import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import "../styles/signup.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      saveToken(data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <section className="signup-showcase" aria-label="Velvet Invite">
        <div className="signup-showcase-content">
          <span className="signup-eyebrow">VELVET INVITE</span>
          <h1>Welcome back to your celebrations.</h1>
          <p>Pick up where you left off and keep creating moments worth remembering.</p>
        </div>
      </section>
      <section className="signup-card" aria-labelledby="login-title">
        <div className="signup-card-header">
          <span className="signup-mobile-brand">VELVET INVITE</span>
          <h2 id="login-title">Welcome back</h2>
          <p>Log in to continue planning.</p>
        </div>
        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <p className="signup-error" role="alert">{error}</p>}
          <button className="signup-submit" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="signup-login-prompt">
          Need an account? <Link to="/signup">Sign up</Link>
        </p>
      </section>
    </main>
  );
}

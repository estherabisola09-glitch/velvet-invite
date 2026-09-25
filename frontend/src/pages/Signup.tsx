import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import "../styles/signup.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await signup(form);
      login(data.access_token);
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
          <h1>Make every moment worth remembering.</h1>
          <p>Bring your people together around invitations that feel as special as the occasion.</p>
        </div>
        <div className="signup-brand-card">
          <span className="signup-brand-mark">V</span>
          <span>Designed for your next celebration</span>
        </div>
      </section>

      <section className="signup-card" aria-labelledby="signup-title">
        <div className="signup-card-header">
          <span className="signup-mobile-brand">VELVET INVITE</span>
          <h2 id="signup-title">Create your account</h2>
          <p>Start planning something unforgettable.</p>
        </div>

        <div className="signup-oauth-options">
          <button className="signup-oauth-button" type="button">
            <span className="signup-oauth-icon signup-google-icon">G</span>
            Continue with Google
          </button>
          <button className="signup-oauth-button" type="button">
            <span className="signup-oauth-icon signup-github-icon">GH</span>
            Continue with GitHub
          </button>
        </div>

        <div className="signup-divider"><span>or sign up with email</span></div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email address
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} required />
          </label>
          <label>
            Confirm password
            <input name="confirm_password" type="password" placeholder="Repeat your password" value={form.confirm_password} onChange={handleChange} required />
          </label>
          {error && <p className="signup-error" role="alert">{error}</p>}
          <button className="signup-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="signup-login-prompt">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
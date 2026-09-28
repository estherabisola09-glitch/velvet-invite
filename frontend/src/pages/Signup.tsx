import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";
import GoogleSignInButton from "../components/GoogleSignInButton";
import PasswordField from "../components/PasswordField";
import PasswordStrength from "../components/PasswordStrength";
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
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-card" aria-labelledby="signup-title">
      <div className="signup-card-header">
        <span className="signup-mobile-brand">VELVET INVITE</span>
        <h2 id="signup-title">Create your account</h2>
        <p>Start planning something unforgettable.</p>
      </div>

      <div className="signup-oauth-options">
        <GoogleSignInButton />
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
        <PasswordField
          id="password"
          label="Password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9\s]).{8,}"
          title="Use at least 8 characters, including a lowercase letter, uppercase letter, and symbol."
          autoComplete="new-password"
        />
        <div className="signup-password-feedback">
          <span className="signup-password-hint">
            At least 8 characters, with lowercase, uppercase, and a symbol.
          </span>
          <PasswordStrength password={form.password} />
        </div>
        <PasswordField
          id="confirm_password"
          label="Confirm password"
          placeholder="Repeat your password"
          value={form.confirm_password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {error && <p className="signup-error" role="alert">{error}</p>}
        <button className="signup-submit" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="signup-login-prompt">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
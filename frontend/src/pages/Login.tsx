import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import PasswordField from "../components/PasswordField";
import "../styles/signup.css";

export default function Login({ active = true }: { active?: boolean }) {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("oauth_error")
      ? "Google sign-in failed. Please try again or log in with your email."
      : "",
  );
  const [showResetHelp, setShowResetHelp] = useState(false);
  const [successMessage] = useState(
    searchParams.get("registered") === "1"
      ? "Account created. Log in with your email and password to continue."
      : "",
  );
  const [loading, setLoading] = useState(false);
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!active) return;

    const accessToken = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
    if (accessToken) {
      saveToken(accessToken);
      navigate("/dashboard", { replace: true });
    }
  }, [active, navigate, saveToken]);

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
    <div className="signup-card" aria-labelledby="login-title">
      <div className="signup-card-header">
        <span className="signup-mobile-brand">VELVET INVITE</span>
        <h2 id="login-title">Welcome back</h2>
        <p>Enter the email and password you used to create your account.</p>
      </div>
      <div className="signup-oauth-options">
        <GoogleSignInButton />
      </div>
      <div className="signup-divider"><span>or log in with email</span></div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          Username (email address)
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          className="signup-forgot-link"
          type="button"
          aria-expanded={showResetHelp}
          onClick={() => setShowResetHelp((current) => !current)}
        >
          Forgot password?
        </button>
        {showResetHelp && (
          <p className="signup-password-hint" role="status">
            Password reset is not available yet. Please contact Velvet Invite support for help.
          </p>
        )}
        {successMessage && <p className="signup-success" role="status">{successMessage}</p>}
        {error && <p className="signup-error" role="alert">{error}</p>}
        <button className="signup-submit" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="signup-login-prompt">
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
      <p className="signup-privacy-note">
        Keep your password private. We use your email to identify your account and protect access.
      </p>
    </div>
  );
}

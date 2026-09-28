import { Link, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

type AuthMode = "signup" | "login";

export default function AuthLayout() {
  const location = useLocation();
  const mode: AuthMode = location.pathname === "/login" ? "login" : "signup";

  return (
    <main className={`signup-page auth-mode-${mode}`}>
      <div className="auth-orb auth-orb-one" aria-hidden="true" />
      <div className="auth-orb auth-orb-two" aria-hidden="true" />
      <div className={`auth-shell auth-shell-${mode}`}>
        <div className="auth-forms">
          <section
            className="auth-form-card auth-signup-card"
            aria-hidden={mode !== "signup"}
            inert={mode !== "signup"}
          >
            <Signup />
          </section>
          <section
            className="auth-form-card auth-login-card"
            aria-hidden={mode !== "login"}
            inert={mode !== "login"}
          >
            <Login active={mode === "login"} />
          </section>
        </div>

        <section className="auth-velvet-panel" aria-label="Velvet Invite">
          <div
            className="auth-velvet-copy auth-velvet-copy-signup"
            aria-hidden={mode !== "signup"}
            inert={mode !== "signup"}
          >
            <span className="auth-velvet-eyebrow">VELVET INVITE</span>
            <h1>Make every moment worth remembering.</h1>
            <p>Bring your people together around invitations that feel as special as the occasion.</p>
            <span className="auth-velvet-caption">Designed for your next celebration</span>
            <Link className="auth-velvet-button" to="/login">Sign in</Link>
          </div>
          <div
            className="auth-velvet-copy auth-velvet-copy-login"
            aria-hidden={mode !== "login"}
            inert={mode !== "login"}
          >
            <span className="auth-velvet-eyebrow">VELVET INVITE</span>
            <h1>Welcome back to your celebrations.</h1>
            <p>Pick up where you left off and keep creating moments worth remembering.</p>
            <span className="auth-velvet-caption">Designed for your next celebration</span>
            <Link className="auth-velvet-button" to="/signup">Sign up</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

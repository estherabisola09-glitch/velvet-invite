const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function GoogleSignInButton() {
  return (
    <button
      className="signup-oauth-button"
      type="button"
      onClick={() => window.location.assign(`${API_BASE_URL}/api/auth/google`)}
    >
      <svg
        className="signup-google-icon"
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="20"
        height="20"
      >
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.05 5.05 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.27-4.75 3.27-8.09Z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.99 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84A11 11 0 0 0 12 23Z" />
        <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.16A11 11 0 0 0 1 12c0 1.78.43 3.46 1.16 4.94l3.68-2.84Z" />
        <path fill="#EA4335" d="M12 5.37c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.84 6.06L5.84 9.9c.87-2.6 3.3-4.53 6.16-4.53Z" />
      </svg>
      Continue with Google
    </button>
  );
}

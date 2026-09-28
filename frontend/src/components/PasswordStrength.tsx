interface PasswordStrengthProps {
  password: string;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[^A-Za-z0-9\s]/.test(password),
  ];
  const percentage = (checks.filter(Boolean).length / checks.length) * 100;
  const strength = percentage === 100 ? "Strong" : percentage >= 50 ? "Getting stronger" : "Weak";

  return (
    <div className="signup-password-strength" aria-live="polite">
      <div className="signup-password-strength-label">
        <span>Password strength</span>
        <span>{strength} · {percentage}%</span>
      </div>
      <div
        className="signup-password-strength-track"
        role="progressbar"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <span
          className={`signup-password-strength-fill strength-${percentage}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

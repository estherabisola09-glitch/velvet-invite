import { useState, type ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  title?: string;
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  required = true,
  minLength,
  pattern,
  title,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="signup-password-field" htmlFor={id}>
      {label}
      <span className="signup-password-input-wrap">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          pattern={pattern}
          title={title}
          required={required}
        />
        <button
          className="signup-password-toggle"
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </span>
    </label>
  );
}

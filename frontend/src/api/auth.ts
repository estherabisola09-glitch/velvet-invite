const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_BASE = `${API_BASE_URL}/api/auth`;

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface SignupResponse {
  message: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface LoginData {
  email: string;
  password: string;
}

function apiErrorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item: unknown) => {
      if (
        item &&
        typeof item === "object" &&
        "msg" in item &&
        typeof item.msg === "string"
      ) {
        return [item.msg];
      }
      return [];
    });
    if (messages.length > 0) return messages.join(". ");
  }
  return fallback;
}

export async function signup(data: SignupData): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(apiErrorMessage(result.detail, "Signup failed"));
  return result;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(apiErrorMessage(result.detail, "Login failed"));
  return result;
}

export async function getMe(token: string) {
  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto" }}>
      <h2>Welcome to your Dashboard</h2>
      <p>Phase 1 complete — auth is working end to end.</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}
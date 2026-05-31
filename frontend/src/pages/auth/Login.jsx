import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const DEMO_USERS = [
  { role: "Admin", email: "admin@test.com" },
  { role: "Manager", email: "manager@test.com" },
  { role: "Employee", email: "employee1@test.com" },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, role } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "ADMIN") navigate("/admin");
      else if (role === "MANAGER") navigate("/manager");
      else navigate("/employee");

    } catch (error) {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email) => {
    setEmail(email);
    setPassword("password123");
  };

  return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Leave Management System</h2>

          <form onSubmit={handleLogin}>
            <input
                type="email"
                placeholder="Email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button
                type="submit"
                className={`login-button ${loading ? "loading" : ""}`}
                disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="demo-section">
            <p className="demo-heading">Try a demo account</p>
            <div className="demo-users">
              {DEMO_USERS.map((user) => (
                  <button
                      key={user.role}
                      className="demo-chip"
                      onClick={() => fillCredentials(user.email)}
                      type="button"
                  >
                    {user.role}
                  </button>
              ))}
            </div>
            <p className="demo-password">Password for all: <span>password123</span></p>
          </div>
        </div>
      </div>
  );
}

export default Login;
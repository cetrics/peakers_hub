import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./css/AdminLogin.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("➡️ Sending login request:", email);

      const params = new URLSearchParams(location.search);
      const from = params.get("from") || "/";

      const response = await axios.post("/api/login", {
        email,
        password,
      });

      console.log("✅ Login response:", response.data);

      if (response.data.success) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("role", response.data.role);

        console.log("🔀 Redirecting to:", from);
        navigate(from, { replace: true });
      } else {
        setError(response.data.message || "Login failed");
        console.warn("⚠️ Login failed:", response.data.message);
      }
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1>Sign-In</h1>

        {error && <div className="admin-login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="email">Email or mobile phone number</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Show terms + register only for customers */}
        {!location.pathname.startsWith("/admin") && (
          <>
            <div className="admin-login-terms">
              By continuing, you agree to Peakers Hub's
              <a href="/conditions"> Conditions of Use </a>
              and <a href="/privacy"> Privacy Notice</a>.
            </div>

            <div className="admin-login-divider">
              <span>New to Peakers Hub?</span>
            </div>

            <Link to="/register" className="admin-create-account-link">
              <button className="admin-create-account">
                Create your Peakers Hub account
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

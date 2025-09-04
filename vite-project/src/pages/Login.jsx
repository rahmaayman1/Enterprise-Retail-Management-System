import React, { useState } from "react";
import "./login.css"; 
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation function
  const validate = () => {
    const validationErrors = {};
    if (!email) validationErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) validationErrors.email = "Email is invalid";

    if (!password) validationErrors.password = "Password is required";
    else if (password.length < 6) validationErrors.password = "Password must be at least 6 characters";

    return validationErrors;
  };

  // Handle form submit (mock)
  const handleSubmit = async(e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // call backend login API
      const response = await apiClient.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      // نفترض الباك إند بيرجع { token, role, userName }
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("userName", response.userName);

      navigate("/dashboard");
    } catch (error) {
      setErrors({ general: error.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>SAMA Enterprise Retail Management System</h2>
        <p>Welcome! Please login to access your account.</p>

        {errors.general && <div className="error general">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

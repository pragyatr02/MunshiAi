import { useState } from "react";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      setMessage("Login successful!");
      console.log(response.data);
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.detail || "Login failed"
      );
    }
  };

  return (
    <div>
      <h1>MunshiAI</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
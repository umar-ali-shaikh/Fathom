import { useState } from "react";
import "../style/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { handleRegister, loading, error } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const success = await handleRegister(username, email, password);
    if (success) {
      navigate("/");
    }
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <input
            onInput={(e) => {
              setUsername(e.target.value);
            }}
            value={username}
            type="text"
            name="username"
            placeholder="Enter Username"
            required
          />
          <input
            onInput={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
            type="email"
            name="email"
            placeholder="Enter Email"
            required
          />
          <input
            onInput={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
            type="password"
            name="password"
            placeholder="Enter Password"
            required
          />
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p>
          Already have an account??{" "}
          <Link className="toggleAuthForm" to="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;

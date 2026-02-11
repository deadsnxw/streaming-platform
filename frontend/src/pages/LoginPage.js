import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../features/components/LoginForm";
import { loginForgotButton } from "../styles/LoginPageStyles";

export default function LoginPage({ onLogin }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    onLogin?.(user);
    navigate("/");
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      <LoginForm onSuccess={handleSuccess} onError={setError} />
      <p>
        <button
          type="button"
          onClick={() => navigate("/password-reset")}
          style={loginForgotButton}
        >
          Забули пароль?
        </button>
      </p>
      <p>
        Not registered? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

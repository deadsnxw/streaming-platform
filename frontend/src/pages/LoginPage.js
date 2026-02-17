import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../features/components/LoginForm";
import "../styles/LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSuccess = (user) => {
    onLogin?.(user);
    navigate("/");
  };

  return (
    <div className="loginContainer"> 
      <div className="star-background"/>
      <div className="login-left">
        
        <div className="text-content">
          <h1 className="main-title">
            Стань<br />
            частиною<br />
            живого<br />
            моменту.
          </h1>
          <p className="subtitle">
            Твій простір для живого відео.<br />
            Разом із мільйонами однодумців.
          </p>
        </div>
      </div>

      <div className="login-right">
        {error && <div className="error">{error}</div>}
        <h1 className="login-right-title">Увійти</h1>

        <LoginForm onSuccess={handleSuccess} onError={setError} />

        <div className="login-actions">
          <button type="button" className="login-forgot-btn" onClick={() => navigate("/password-reset")}>
            Забули пароль?
          </button>
          <button type="submit" form="login-form" className="submit-btn">
            Увійти
          </button>
        </div>

        <p className="login-register-text">
          Не маєте акаунту? <Link to="/register">Зареєструватися</Link>
        </p>
      </div>
    </div>
  );
}

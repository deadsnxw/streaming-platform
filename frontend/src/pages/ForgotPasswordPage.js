import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RequestResetCode from "../features/components/RequestResetCode";
import "../styles/PasswordResetPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div className="passwordResetContainer">
      <div className="password-reset-star-background" />

      <div className="password-reset-left">
        <div className="password-reset-text-content">
          <h1 className="password-reset-main-title">
            Стань<br />
            частиною<br />
            живого<br />
            моменту.
          </h1>
          <p className="password-reset-subtitle">
            Твій простір для живого відео.<br />
            Разом із мільйонами однодумців.
          </p>
        </div>
      </div>

      <div className="password-reset-right">
        <h1 className="password-reset-right-title">Відновлення пароля</h1>
        
        <RequestResetCode
          onNext={(enteredEmail) => {
            setEmail(enteredEmail);
            navigate("/password-reset/verify", { state: { email: enteredEmail } });
          }}
        />

        <p className="password-reset-back-text">
          Пам'ятаєте пароль? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}
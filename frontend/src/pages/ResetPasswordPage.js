import { Link, useLocation, useNavigate } from "react-router-dom";
import ResetPassword from "../features/components/ResetPassword";
import "../styles/PasswordResetPage.css";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const code = location.state?.code;

  if (!email || !code) {
    navigate("/password-reset");
    return null;
  }

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
        <h1 className="password-reset-right-title">Новий пароль</h1>
        
        <ResetPassword email={email} code={code} />

        <p className="password-reset-back-text">
          <Link to="/login">Повернутися до входу</Link>
        </p>
      </div>
    </div>
  );
}
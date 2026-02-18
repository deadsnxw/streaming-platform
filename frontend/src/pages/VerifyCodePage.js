import { Link, useLocation, useNavigate } from "react-router-dom";
import VerifyCode from "../features/components/VerifyCode";
import "../styles/PasswordResetPage.css";

export default function VerifyCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    navigate("/password-reset");
    return null;
  }

  return (
    <div className="passwordResetContainer">
      <div className="password-reset-star-background" />

      <div className="password-reset-left">
        <div className="password-reset-text-content">
          <h1 className="password-reset-main-title">
            Перевірте<br />
            свою<br />
            пошту.
          </h1>
          <p className="password-reset-subtitle">
            Ми надіслали код підтвердження<br />
            на вашу електронну адресу.
          </p>
        </div>
      </div>

      <div className="password-reset-right">
        <h1 className="password-reset-right-title">Введіть код</h1>
        
        <VerifyCode
          email={email}
          onVerified={(code) =>
            navigate("/password-reset/new-password", { state: { email, code } })
          }
        />

        <p className="password-reset-back-text">
          <Link to="/password-reset">Назад</Link>
        </p>
      </div>
    </div>
  );
}
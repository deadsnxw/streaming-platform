import { useLocation, useNavigate } from "react-router-dom";
import ResetPassword from "../features/components/ResetPassword";

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
    <div>
      <h1>Встановлення нового пароля</h1>
      <ResetPassword email={email} code={code}/>
    </div>
  );
}
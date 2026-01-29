import { useLocation, useNavigate } from "react-router-dom";
import VerifyCode from "../features/components/VerifyCode";

export default function VerifyCodePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  if (!email) {
    navigate("/password-reset");
    return null;
  }

  return (
    <div>
      <h1>Підтвердження коду</h1>
      <VerifyCode
        email={email}
        onVerified={(code) =>
          navigate("/password-reset/new-password", { state: { email, code } })
        }
      />
    </div>
  );
}
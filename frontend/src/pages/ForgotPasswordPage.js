import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RequestResetCode from "../features/components/RequestResetCode";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div>
      <h1>Відновлення пароля</h1>
      <RequestResetCode
        onNext={(enteredEmail) => {
          setEmail(enteredEmail);
          navigate("/password-reset/verify", { state: { email: enteredEmail } });
        }}
      />
    </div>
  );
}
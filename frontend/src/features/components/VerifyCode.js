import { useState } from "react";
import { fetchAPI } from "../../services/api";

export default function VerifyCode({ email, onVerified }) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchAPI("/auth/password-reset/verify", {
        method: "POST",
        body: { email, code },
      });
      setMessage(data.message);
      onVerified(code);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleResend = async () => {
    try {
      const data = await fetchAPI("/auth/password-reset/resend", {
        method: "POST",
        body: { email },
      });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Підтвердження коду</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Введіть код"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Перевірити код</button>
      </form>
      <button onClick={handleResend}>Надіслати код ще раз</button>
      {message && <p>{message}</p>}
    </div>
  );
}
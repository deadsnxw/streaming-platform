import { useState } from "react";
import { fetchAPI } from "../../services/api";

export default function ResetPassword({ email, code }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Паролі не співпадають");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Пароль повинен містити принаймні 6 символів");
      return;
    }
    
    setPasswordError("");
    
    try {
      const data = await fetchAPI("/auth/password-reset/reset", {
        method: "POST",
        body: { email, code, newPassword },
      });
      setMessage(data.message);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Встановлення нового пароля</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Новий пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Підтвердження нового паролю"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
        <button type="submit">Встановити пароль</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
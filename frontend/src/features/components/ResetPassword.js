import { useState } from "react";
import { fetchAPI } from "../../services/api";

export default function ResetPassword({ email }) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchAPI("/password-reset/reset", {
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
          type="text"
          placeholder="Код з email"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Новий пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Встановити пароль</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
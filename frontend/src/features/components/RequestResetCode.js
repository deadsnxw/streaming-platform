import { useState } from "react";
import { fetchAPI } from "../../services/api";

export default function RequestResetCode() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchAPI("/password-reset/request", {
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
      <h2>Відновлення пароля</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Введіть ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Надіслати код</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
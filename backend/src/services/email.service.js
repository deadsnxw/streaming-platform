import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetCode = async (email, code) => {
  return resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Відновлення пароля",
    html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Відновлення пароля</h2>
        <p>Ваш код підтвердження:</p>
        <h1>${code}</h1>
        <p>Код дійсний <b>10 хвилин</b>.</p>
        <p>Якщо ви не запитували зміну пароля — просто проігноруйте цей лист.</p>
      </div>
    `,
  });
};
import React from "react";
import LoginForm from "../features/auth/LoginForm";

export default function LoginPage({ onLogin }) {
    return (
        <div>
            <h1>Login</h1>
            <LoginForm onLogin={onLogin} />
        </div>
    );
}

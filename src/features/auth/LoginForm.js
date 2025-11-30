import React, { useState } from "react";
import { loginUser } from "./authAPI";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onLogin }) {
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMsg("");
        try {
            const user = await loginUser({ login, password });
            onLogin(user);
            navigate("/");
        } catch (error) {
            setMsg(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nickname or Email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Login</button>
            {msg && <p>{msg}</p>}
        </form>
    );
}

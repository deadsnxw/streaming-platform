import React, { useState } from "react";
import { registerUser } from "./authAPI";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [birthday, setBirthday] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMsg("");
        try {
            await registerUser({ nickname, email, password, birthday });
            setMsg("User registered successfully!");
            navigate("/login");
        } catch (error) {
            setMsg(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <input
                type="date"
                placeholder="Birthday"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
            />
            <button type="submit">Register</button>
            {msg && <p>{msg}</p>}
        </form>
    );
}
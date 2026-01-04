import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../features/components/RegisterForm";

export default function RegisterPage() {
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleSuccess = (user) => {
        setMessage('Registration successful, please login');
        navigate('/login');
    };

    return (
        <div>
            <h1>Register</h1>
            {message && <div className="info">{message}</div>}
            <RegisterForm onSuccess={handleSuccess} />
            <p>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
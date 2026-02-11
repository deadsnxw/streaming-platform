import React from "react";
import { useNavigate } from "react-router-dom";
import {
    landingContainer,
    landingText,
    landingTitle,
    landingSubtitle,
    landingButtons,
    loginButton,
    registerButton,
} from "../styles/LandingPageStyles";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={landingContainer}>
            <div style={landingText}>
                <h1 style={landingTitle}>Ласкаво просимо</h1>
                <p style={landingSubtitle}>
                    Щоб продовжити, увійдіть у свій акаунт або створіть новий.
                </p>
            </div>

            <div style={landingButtons}>
                <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={loginButton}
                >
                    Увійти
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/register")}
                    style={registerButton}
                >
                    Реєстрація
                </button>
            </div>
        </div>
    );
}


import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

export default function App() {
    const [user, setUser] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={setUser} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

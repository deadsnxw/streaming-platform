import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import LivePage from "./pages/LivePage";
import { authService } from "./services/authService";
import UploadVideoPage from "./pages/UploadVideoPage";

export default function App() {
    const [user, setUser] = useState(() => authService.getCurrentUser());

    useEffect(() => {
        const handleStorage = () => setUser(authService.getCurrentUser());
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <Router>
            <header className="app-header">
                <nav>
                    <Link to="/">Home</Link>
                    <Link to="/live">Live</Link>
                    {user ? (
                        <>
                            <Link to="/profile">Profile</Link>
                            <button
                                onClick={() => {
                                    authService.logout();
                                    setUser(null);
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </header>

            <Routes>
                <Route path="/login" element={<LoginPage onLogin={(u) => setUser(u)} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile" element={user ? <ProfilePage user={user} onLogout={() => { authService.logout(); setUser(null); }} /> : <Navigate to="/login" replace />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/upload" element={<UploadVideoPage />} />
                <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

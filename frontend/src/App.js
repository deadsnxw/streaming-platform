import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import LivePage from "./pages/LivePage";
import { authService } from "./services/authService";
import UploadVideoPage from "./pages/UploadVideoPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyCodePage from "./pages/VerifyCodePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { ChatProvider } from "./context/chatContext";
import FloatingChatButton from "./features/components/FloatingChatButton";
import ChatWindow from "./features/components/ChatWindow";
import LandingPage from "./pages/LandingPage";

// Компонент для умовного відображення чату
function ChatComponents({ user }) {
    const location = useLocation();
    const hideChat = ["/login", "/register", "/password-reset"].some(path => 
        location.pathname.includes(path)
    );

    if (!user || hideChat) return null;

    return (
        <>
            <FloatingChatButton />
            <ChatWindow />
        </>
    );
}

export default function App() {
    const [user, setUser] = useState(() => authService.getCurrentUser());

    useEffect(() => {
        const handleStorage = () => setUser(authService.getCurrentUser());
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <ChatProvider>
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
                    <Route path="/register" element={<RegisterPage onRegister={(u) => setUser(u)} />} />
                    <Route path="/profile/:userId" element={<ProfilePage />} />
                    {/* ВИПРАВЛЕНО: видалено непотрібні пропси */}
                    <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
                    <Route path="/live" element={<LivePage />} />
                    <Route path="/upload" element={<UploadVideoPage />} />
                    <Route path="/" element={user ? <HomePage user={user} /> : <LandingPage />} />
                    <Route path="/password-reset" element={<ForgotPasswordPage />} />
                    <Route path="/password-reset/verify" element={<VerifyCodePage />} />
                    <Route path="/password-reset/new-password" element={<ResetPasswordPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* ВИПРАВЛЕНО: використання useLocation через компонент */}
                <ChatComponents user={user} />
            </Router>
        </ChatProvider>
    );
}
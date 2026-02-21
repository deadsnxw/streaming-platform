import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getUploadsBaseUrl } from "../../services/api";
import "../../styles/NavBar.css";

export default function NavBar({ user }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchInput, setSearchInput] = useState("");

    const searchParams = new URLSearchParams(location.search || "");
    const isFollowing = searchParams.get("feed") === "subscriptions" && location.pathname === "/";
    const isRecommendations = location.pathname === "/" && !searchParams.get("feed");

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchInput.trim();
        if (q) {
            navigate(`/?q=${encodeURIComponent(q)}`);
            setSearchInput("");
        } else {
            navigate("/");
        }
    };

    if (!user) return null;

    const profilePath = "/profile";
    const avatarSrc = user.avatar_url ? getUploadsBaseUrl() + user.avatar_url : null;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo" aria-label="Головна">
                    <span className="navbar-logo-icon" />
                </Link>
                <Link
                    to="/?feed=subscriptions"
                    className={"navbar-link" + (isFollowing ? " active" : "")}
                >
                    Відстежуванні
                </Link>
                <Link
                    to="/"
                    className={"navbar-link" + (isRecommendations ? " active" : "")}
                >
                    Рекомендації
                </Link>
            </div>

            <form className="navbar-search" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Пошук..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="navbar-search-input"
                />
                <button type="submit" className="navbar-search-btn" aria-label="Пошук">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </button>
            </form>

            <div className="navbar-right">
                <button
                    type="button"
                    className="navbar-icon-btn"
                    aria-label="Чат"
                    onClick={() => window.dispatchEvent(new Event("openChatPanel"))}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                </button>
                <button
                    type="button"
                    className="navbar-icon-btn"
                    aria-label="Сповіщення"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                </button>
                <Link to={profilePath} className="navbar-profile-link" aria-label="Профіль">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="" className="navbar-profile" />
                    ) : (
                        <span className="navbar-profile-placeholder">?</span>
                    )}
                </Link>
            </div>
        </nav>
    );
}

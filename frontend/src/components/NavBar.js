import React from "react";
import { Link } from "react-router-dom";
import { getUploadsBaseUrl } from "../services/api";
import "../styles/NavBar.css";

export default function NavBar({ user }) {
    if (!user) return null;

    const profilePath = "/profile";
    const avatarSrc = user.avatar_url ? getUploadsBaseUrl() + user.avatar_url : null;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-link">Головна</Link>
                <Link to="/live" className="navbar-link">Live</Link>
            </div>
            <div className="navbar-right">
                <Link to={profilePath} aria-label="Профіль">
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

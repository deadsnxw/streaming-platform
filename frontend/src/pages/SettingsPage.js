import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAPI, getUploadsBaseUrl } from "../services/api";
import { authService } from "../services/authService";
import "../styles/SettingsPage.css";

const BIO_MAX_LENGTH = 500;

export default function SettingsPage({ onProfileUpdate, onLogout }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [nickname, setNickname] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [fieldError, setFieldError] = useState({ nickname: "", bio: "" });

    useEffect(() => {
        const load = async () => {
            if (!authService.getCurrentUser()) {
                navigate("/login");
                return;
            }
            try {
                const data = await fetchAPI("/users/me", { method: "GET" });
                setUser(data);
                setNickname(data.nickname || "");
                setBio(data.bio || "");
                if (data.avatar_url) {
                    setAvatarPreview(getUploadsBaseUrl() + data.avatar_url);
                }
            } catch (err) {
                setError("Не вдалося завантажити профіль.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [navigate]);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        const url = URL.createObjectURL(file);
        setAvatarPreview(url);
        return () => URL.revokeObjectURL(url);
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(null);
        setFieldError({ nickname: "", bio: "" });

        if (bio.length > BIO_MAX_LENGTH) {
            setFieldError((p) => ({ ...p, bio: `Біо не більше ${BIO_MAX_LENGTH} символів.` }));
            return;
        }

        setSaving(true);
        try {
            if (avatarFile) {
                const form = new FormData();
                form.append("avatar", avatarFile);
                const updated = await fetchAPI("/users/me/avatar", {
                    method: "POST",
                    body: form,
                });
                setUser((u) => (u ? { ...u, ...updated } : updated));
                const stored = authService.getCurrentUser();
                if (stored) {
                    localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
                    onProfileUpdate?.({ ...stored, ...updated });
                }
                setAvatarFile(null);
            }

            const payload = {};
            if (nickname.trim() !== (user?.nickname || "")) payload.nickname = nickname.trim();
            if (bio !== (user?.bio || "")) payload.bio = bio;

            if (Object.keys(payload).length > 0) {
                const updated = await fetchAPI("/users/me", {
                    method: "PATCH",
                    body: payload,
                });
                setUser((u) => (u ? { ...u, ...updated } : updated));
                const stored = authService.getCurrentUser();
                if (stored) {
                    localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
                    onProfileUpdate?.({ ...stored, ...updated });
                }
            }

            setSuccess("Зміни збережено.");
        } catch (err) {
            const msg = err.message || "Помилка збереження.";
            if (msg.includes("Nickname already exists")) {
                setFieldError((p) => ({ ...p, nickname: "Цей нікнейм вже зайнятий." }));
            } else if (msg.includes("Bio must be")) {
                setFieldError((p) => ({ ...p, bio: `Біо не більше ${BIO_MAX_LENGTH} символів.` }));
            } else {
                setError(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        onLogout?.();
        navigate("/");
    };

    if (loading) {
        return <div className="settings-page"><p>Завантаження...</p></div>;
    }

    return (
        <div className="settings-page">
            <h1>Налаштування</h1>
            <p style={{ margin: 0, color: "#666", marginBottom: 24 }}>Редагуйте профіль або вийдіть з акаунту.</p>

            {error && <div className="settings-error-box">{error}</div>}
            {success && <div className="settings-success">{success}</div>}

            <section className="settings-section">
                <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Аватар</h2>
                <div className="settings-avatar-wrap">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="settings-avatar-preview" />
                    ) : (
                        <div className="settings-avatar-placeholder">Фото</div>
                    )}
                    <div className="settings-avatar-upload">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleAvatarChange}
                        />
                    </div>
                </div>
            </section>

            <section className="settings-section">
                <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Нікнейм</h2>
                <div className="settings-field">
                    <label htmlFor="settings-nickname">Нікнейм</label>
                    <input
                        id="settings-nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => {
                            setNickname(e.target.value);
                            setFieldError((p) => ({ ...p, nickname: "" }));
                        }}
                        placeholder="Введіть нікнейм"
                    />
                    {fieldError.nickname && <div className="field-error">{fieldError.nickname}</div>}
                </div>
            </section>

            <section className="settings-section">
                <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Біо</h2>
                <div className="settings-field">
                    <label htmlFor="settings-bio">Опис профілю</label>
                    <textarea
                        id="settings-bio"
                        value={bio}
                        onChange={(e) => {
                            setBio(e.target.value);
                            setFieldError((p) => ({ ...p, bio: "" }));
                        }}
                        placeholder="Розкажіть про себе"
                        maxLength={BIO_MAX_LENGTH}
                    />
                    <div className="field-hint">{bio.length} / {BIO_MAX_LENGTH}</div>
                    {fieldError.bio && <div className="field-error">{fieldError.bio}</div>}
                </div>
            </section>

            <div className="settings-actions">
                <button
                    type="button"
                    className="settings-btn settings-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Збереження…" : "Зберегти"}
                </button>
                <button
                    type="button"
                    className="settings-btn settings-btn-danger"
                    onClick={handleLogout}
                >
                    Вийти
                </button>
            </div>
        </div>
    );
}

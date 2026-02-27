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
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [fieldError, setFieldError] = useState({ nickname: "", bio: "" });
    const [streamKey, setStreamKey] = useState(null);
    const [rtmpUrl, setRtmpUrl] = useState(null);
    const [showStreamKey, setShowStreamKey] = useState(false);
    const [streamTitle, setStreamTitle] = useState("");
    const [streamDescription, setStreamDescription] = useState("");
    const [streamInfoSaving, setStreamInfoSaving] = useState(false);

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
                if (data.banner_url) {
                    setBannerPreview(getUploadsBaseUrl() + data.banner_url);
                }
            } catch (err) {
                setError("Не вдалося завантажити профіль.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [navigate]);

    /* ── Load stream key ── */
    useEffect(() => {
        const loadStreamKey = async () => {
            try {
                const data = await fetchAPI("/streams/me/key", { method: "GET" });
                setStreamKey(data.stream_key || null);
                setRtmpUrl(data.rtmp_url || null);
            } catch {
                // silently skip — user may not have a stream key
            }
        };
        const loadStreamInfo = async () => {
            try {
                const me = authService.getCurrentUser();
                if (!me) return;
                const data = await fetchAPI(`/streams/status/${me.user_id}`, { method: "GET" });
                setStreamTitle(data.stream_title || "");
                setStreamDescription(data.stream_description || "");
            } catch { /* ignore */ }
        };
        if (authService.getCurrentUser()) {
            loadStreamKey();
            loadStreamInfo();
        }
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
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

            if (bannerFile) {
                const form = new FormData();
                form.append("banner", bannerFile);
                const updated = await fetchAPI("/users/me/banner", {
                    method: "POST",
                    body: form,
                });
                setUser((u) => (u ? { ...u, ...updated } : updated));
                const stored = authService.getCurrentUser();
                if (stored) {
                    localStorage.setItem("user", JSON.stringify({ ...stored, ...updated }));
                    onProfileUpdate?.({ ...stored, ...updated });
                }
                setBannerFile(null);
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
                <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Банер профілю</h2>
                <p className="settings-hint">Завантажте банер для сторінки профілю (відображається зверху).</p>
                <div className="settings-banner-wrap">
                    {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner" className="settings-banner-preview" />
                    ) : (
                        <div className="settings-banner-placeholder">Банер</div>
                    )}
                    <div className="settings-banner-upload">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleBannerChange}
                        />
                    </div>
                </div>
            </section>

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

            <section className="settings-section">
                <h2 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Стрім</h2>
                <p className="settings-hint">Використовуйте ці дані для налаштування OBS або іншого стрім-софту.</p>

                <div className="settings-field">
                    <label>RTMP URL</label>
                    <div className="settings-stream-row">
                        <input
                            type="text"
                            readOnly
                            value={rtmpUrl || "Завантаження..."}
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            type="button"
                            className="settings-copy-btn"
                            onClick={() => rtmpUrl && navigator.clipboard.writeText(rtmpUrl)}
                        >
                            Копіювати
                        </button>
                    </div>
                </div>

                <div className="settings-field">
                    <label>Ключ потоку (Stream Key)</label>
                    <div className="settings-stream-row">
                        <input
                            type={showStreamKey ? "text" : "password"}
                            readOnly
                            value={streamKey || "Завантаження..."}
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            type="button"
                            className="settings-copy-btn"
                            onClick={() => setShowStreamKey((s) => !s)}
                        >
                            {showStreamKey ? "Сховати" : "Показати"}
                        </button>
                        <button
                            type="button"
                            className="settings-copy-btn"
                            onClick={() => streamKey && navigator.clipboard.writeText(streamKey)}
                        >
                            Копіювати
                        </button>
                    </div>
                </div>

                <div className="settings-field">
                    <label htmlFor="stream-title">Назва стріму</label>
                    <input
                        id="stream-title"
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="Наприклад: Граємо в Minecraft"
                        maxLength={200}
                    />
                </div>

                <div className="settings-field">
                    <label htmlFor="stream-desc">Опис стріму</label>
                    <textarea
                        id="stream-desc"
                        value={streamDescription}
                        onChange={(e) => setStreamDescription(e.target.value)}
                        placeholder="Про що буде стрім..."
                        maxLength={2000}
                    />
                    <div className="field-hint">{streamDescription.length} / 2000</div>
                </div>

                <button
                    type="button"
                    className="settings-btn settings-btn-primary"
                    style={{ marginTop: 8, width: "auto" }}
                    disabled={streamInfoSaving}
                    onClick={async () => {
                        setStreamInfoSaving(true);
                        try {
                            await fetchAPI("/streams/me/info", {
                                method: "PATCH",
                                body: JSON.stringify({
                                    stream_title: streamTitle,
                                    stream_description: streamDescription,
                                }),
                            });
                            setSuccess("Інформацію про стрім збережено.");
                        } catch (err) {
                            setError(err.message || "Не вдалося зберегти інфо стріму.");
                        } finally {
                            setStreamInfoSaving(false);
                        }
                    }}
                >
                    {streamInfoSaving ? "Збереження…" : "Зберегти інфо стріму"}
                </button>
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

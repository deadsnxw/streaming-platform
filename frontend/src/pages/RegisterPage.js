import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { fetchAPI, getUploadsBaseUrl } from "../services/api";
import "../styles/RegisterPage.css";

export default function RegisterPage({ onRegister }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        policyAccepted: false,
        password: "",
        nickname: "",
        birthday: "",
        selectedUserIds: [],
    });
    const [fieldErrors, setFieldErrors] = useState({
        email: "",
        password: "",
        nickname: "",
        birthday: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [popularUsers, setPopularUsers] = useState([]);
    const [popularLoading, setPopularLoading] = useState(false);
    const [popularError, setPopularError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // clear field-specific error on change
        setFieldErrors((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    const toggleUserSelection = (id) => {
        setFormData((prev) => ({
            ...prev,
            selectedUserIds: prev.selectedUserIds.includes(id)
                ? prev.selectedUserIds.filter((x) => x !== id)
                : [...prev.selectedUserIds, id],
        }));
    };

    const isEmailValid = (email) => {
        if (!email) return false;
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validateCurrentStep = () => {
        const newErrors = { email: "", password: "", nickname: "", birthday: "" };

        if (step === 1) {
            if (!formData.email) {
                newErrors.email = "Введіть email.";
            } else if (!isEmailValid(formData.email)) {
                newErrors.email = "Неправильний формат email.";
            }
            if (!formData.policyAccepted) {
                newErrors.email = newErrors.email || "Потрібно погодитись з політикою конфіденційності.";
            }
        } else if (step === 2) {
            if (!formData.password) {
                newErrors.password = "Введіть пароль.";
            } else if (formData.password.length < 6) {
                newErrors.password = "Пароль має містити щонайменше 6 символів.";
            }
        } else if (step === 3) {
            if (!formData.nickname.trim()) {
                newErrors.nickname = "Введіть нікнейм.";
            }
        } else if (step === 4) {
            if (!formData.birthday) {
                newErrors.birthday = "Вкажіть дату народження.";
            }
        }

        setFieldErrors(newErrors);
        // valid when no messages
        return !Object.values(newErrors).some(Boolean);
    };

    const handleNext = async () => {
        setError(null);
        if (!validateCurrentStep()) {
            return;
        }

        // Step 1: email – check if already registered
        if (step === 1) {
            try {
                setLoading(true);
                const data = await authService.checkEmail(formData.email);
                if (data.exists) {
                    setFieldErrors((prev) => ({
                        ...prev,
                        email: "Користувач з таким email вже існує.",
                    }));
                    return;
                }
                setStep(2);
            } catch (err) {
                setError("Не вдалося перевірити email. Спробуйте ще раз.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Step 2: password – only local checks, already validated
        if (step === 2) {
            setStep(3);
            return;
        }

        // Step 3: nickname – check if already taken
        if (step === 3) {
            try {
                setLoading(true);
                const data = await authService.checkNickname(formData.nickname.trim());
                if (data.exists) {
                    setFieldErrors((prev) => ({
                        ...prev,
                        nickname: "Користувач з таким нікнеймом вже існує.",
                    }));
                    return;
                }
                setStep(4);
            } catch (err) {
                setError("Не вдалося перевірити нікнейм. Спробуйте ще раз.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // Step 4 -> register user (all data already pre-validated)
        if (step === 4) {
            try {
                setLoading(true);
                const data = await authService.register({
                    email: formData.email,
                    password: formData.password,
                    nickname: formData.nickname,
                    birthday: formData.birthday,
                });

                if (data?.user) {
                    onRegister?.(data.user);
                }

                setStep(5);
            } catch (err) {
                const message = err.message || "Registration failed";
                const updatedFieldErrors = { ...fieldErrors };

                if (message.includes("Password must be at least 6 characters")) {
                    updatedFieldErrors.password = "Пароль має містити щонайменше 6 символів.";
                } else if (message.includes("Email already exists")) {
                    updatedFieldErrors.email = "Користувач з таким email вже існує.";
                } else if (message.includes("Nickname already exists")) {
                    updatedFieldErrors.nickname = "Користувач з таким нікнеймом вже існує.";
                } else if (message.includes("All fields are required")) {
                    updatedFieldErrors.email = "Усі поля обов'язкові для заповнення.";
                }

                setFieldErrors(updatedFieldErrors);
                setError(message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const loadPopular = async () => {
            setPopularError(null);
            setPopularLoading(true);
            try {
                const users = await fetchAPI("/users/recommended?limit=10", { method: "GET" });
                setPopularUsers(Array.isArray(users) ? users : []);
            } catch (e) {
                setPopularUsers([]);
                setPopularError("Не вдалося завантажити рекомендації.");
            } finally {
                setPopularLoading(false);
            }
        };

        if (step === 5) {
            loadPopular();
        }
    }, [step]);

    const handleFinish = async (doSubscribe) => {
        if (doSubscribe && formData.selectedUserIds.length > 0) {
            try {
                setLoading(true);
                await Promise.all(
                    formData.selectedUserIds.map((channelId) =>
                        fetchAPI("/subscriptions/subscribe", {
                            method: "POST",
                            body: { channelId },
                        })
                    )
                );
            } catch (e) {
                // don't block navigation, but show error briefly
                setError("Не вдалося підписатися на деяких користувачів. Спробуйте пізніше.");
            } finally {
                setLoading(false);
            }
        }

        navigate("/");
    };

    return (
        <div className="register-container">
            <h1>Реєстрація</h1>
            <p className="register-step-info">
                Крок {step} з 5
            </p>

            {error && <div className="register-error-box">{error}</div>}

            {step === 1 && (
                <div className="register-field-group">
                    <label className="register-label">
                        <span>Email</span>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="example@email.com"
                            required
                            className="register-input"
                        />
                        {fieldErrors.email && (
                            <span className="register-field-error">{fieldErrors.email}</span>
                        )}
                    </label>
                    <label className="register-checkbox-label">
                        <input
                            type="checkbox"
                            checked={formData.policyAccepted}
                            onChange={(e) => handleChange("policyAccepted", e.target.checked)}
                        />
                        <span>
                            Я погоджуюсь з політикою конфіденційності та умовами використання платформи.
                        </span>
                    </label>
                </div>
            )}

            {step === 2 && (
                <div className="register-field-group">
                    <label className="register-label">
                        <span>Створіть пароль</span>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            placeholder="Мінімум 6 символів"
                            required
                            minLength={6}
                            className="register-input"
                        />
                        {fieldErrors.password && (
                            <span className="register-field-error">{fieldErrors.password}</span>
                        )}
                    </label>
                </div>
            )}

            {step === 3 && (
                <div className="register-field-group">
                    <label className="register-label">
                        <span>Нікнейм</span>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => handleChange("nickname", e.target.value)}
                            placeholder="Введіть ваш нікнейм"
                            required
                            className="register-input"
                        />
                        {fieldErrors.nickname && (
                            <span className="register-field-error">{fieldErrors.nickname}</span>
                        )}
                    </label>
                </div>
            )}

            {step === 4 && (
                <div className="register-field-group">
                    <label className="register-label">
                        <span>Дата народження</span>
                        <input
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => handleChange("birthday", e.target.value)}
                            required
                            className="register-input"
                        />
                        {fieldErrors.birthday && (
                            <span className="register-field-error">{fieldErrors.birthday}</span>
                        )}
                    </label>
                </div>
            )}

            {step === 5 && (
                <div className="register-popular-wrapper">
                    <p className="register-popular-text">
                        Підпишіться на найпопулярніших користувачів або пропустіть цей крок.
                    </p>
                    <div className="register-popular-list">
                        {popularLoading && <div className="register-popular-loading">Завантаження…</div>}
                        {popularError && <div className="register-popular-error">{popularError}</div>}
                        {!popularLoading && !popularError && popularUsers.length === 0 && (
                            <div className="register-popular-empty">Наразі немає рекомендацій.</div>
                        )}

                        {popularUsers.map((u) => {
                            const selected = formData.selectedUserIds.includes(u.user_id);
                            const avatarSrc = u.avatar_url ? getUploadsBaseUrl() + u.avatar_url : null;
                            return (
                                <button
                                    key={u.user_id}
                                    type="button"
                                    onClick={() => toggleUserSelection(u.user_id)}
                                    className={`register-popular-item ${selected ? "selected" : ""}`}
                                >
                                    {avatarSrc ? (
                                        <img
                                            src={avatarSrc}
                                            alt=""
                                            className="register-popular-avatar"
                                        />
                                    ) : (
                                        <div className="register-popular-avatar register-popular-avatar--placeholder" />
                                    )}
                                    <span className="register-popular-nickname">{u.nickname}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={`register-step-actions ${step === 1 ? "register-step-actions--first" : ""}`}>
                {step > 1 && step < 5 && (
                    <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                        disabled={loading}
                        className="register-back-btn"
                    >
                        Назад
                    </button>
                )}

                {step < 5 && (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading}
                        className="register-next-btn"
                    >
                        {loading ? "Зачекайте..." : "Далі"}
                    </button>
                )}

                {step === 5 && (
                    <div className="register-step-actions-finish">
                        <button type="button" onClick={() => handleFinish(false)} className="register-skip-btn" disabled={loading}>
                            Пропустити
                        </button>
                        <button type="button" onClick={() => handleFinish(true)} className="register-choose-btn" disabled={loading}>
                            {loading ? "Зачекайте..." : "Підписатися"}
                        </button>
                    </div>
                )}
            </div>

            <p style={{ marginTop: "16px" }}>
                Вже маєте акаунт? <Link to="/login">Увійти</Link>
            </p>
        </div>
    );
}


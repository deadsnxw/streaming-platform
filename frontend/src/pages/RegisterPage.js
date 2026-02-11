import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import {
    registerContainer,
    registerStepInfo,
    registerErrorBox,
    registerFieldGroup,
    registerLabel,
    registerInput,
    registerCheckboxLabel,
    registerFieldError,
    registerStepActions,
    registerBackButton,
    registerNextButton,
    registerPopularWrapper,
    registerPopularText,
    registerPopularList,
    registerPopularItem,
    registerSkipButton,
    registerChooseButton,
} from "../styles/RegisterPageStyles";

const popularUsersMock = [
    { id: 1, nickname: "StreamerOne" },
    { id: 2, nickname: "GamerPro" },
    { id: 3, nickname: "MusicLover" },
    { id: 4, nickname: "ProCoder" },
];

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

    const handleFinish = () => {
        navigate("/");
    };

    return (
        <div style={registerContainer}>
            <h1>Реєстрація</h1>
            <p style={registerStepInfo}>
                Крок {step} з 5
            </p>

            {error && (
                <div style={registerErrorBox}>
                    {error}
                </div>
            )}

            {step === 1 && (
                <div style={registerFieldGroup}>
                    <label style={registerLabel}>
                        <span>Email</span>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="example@email.com"
                            required
                            style={registerInput}
                        />
                        {fieldErrors.email && (
                            <span style={registerFieldError}>{fieldErrors.email}</span>
                        )}
                    </label>
                    <label style={registerCheckboxLabel}>
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
                <div style={registerFieldGroup}>
                    <label style={registerLabel}>
                        <span>Створіть пароль</span>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            placeholder="Мінімум 6 символів"
                            required
                            minLength={6}
                            style={registerInput}
                        />
                        {fieldErrors.password && (
                            <span style={registerFieldError}>{fieldErrors.password}</span>
                        )}
                    </label>
                </div>
            )}

            {step === 3 && (
                <div style={registerFieldGroup}>
                    <label style={registerLabel}>
                        <span>Нікнейм</span>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => handleChange("nickname", e.target.value)}
                            placeholder="Введіть ваш нікнейм"
                            required
                            style={registerInput}
                        />
                        {fieldErrors.nickname && (
                            <span style={registerFieldError}>{fieldErrors.nickname}</span>
                        )}
                    </label>
                </div>
            )}

            {step === 4 && (
                <div style={registerFieldGroup}>
                    <label style={registerLabel}>
                        <span>Дата народження</span>
                        <input
                            type="date"
                            value={formData.birthday}
                            onChange={(e) => handleChange("birthday", e.target.value)}
                            required
                            style={registerInput}
                        />
                        {fieldErrors.birthday && (
                            <span style={registerFieldError}>{fieldErrors.birthday}</span>
                        )}
                    </label>
                </div>
            )}

            {step === 5 && (
                <div style={registerPopularWrapper}>
                    <p style={registerPopularText}>
                        Підпишіться на найпопулярніших користувачів або пропустіть цей крок.
                    </p>
                    <div style={registerPopularList}>
                        {popularUsersMock.map((u) => {
                            const selected = formData.selectedUserIds.includes(u.id);
                            return (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => toggleUserSelection(u.id)}
                                    style={registerPopularItem(selected)}
                                >
                                    {u.nickname}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={registerStepActions(step === 1)}>
                {step > 1 && step < 5 && (
                    <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(1, s - 1))}
                        disabled={loading}
                        style={registerBackButton}
                    >
                        Назад
                    </button>
                )}

                {step < 5 && (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading}
                        style={registerNextButton(!loading)}
                    >
                        {loading ? "Зачекайте..." : "Далі"}
                    </button>
                )}

                {step === 5 && (
                    <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
                        <button
                            type="button"
                            onClick={handleFinish}
                            style={registerSkipButton}
                        >
                            Пропустити
                        </button>
                        <button
                            type="button"
                            onClick={handleFinish}
                            style={registerChooseButton}
                        >
                            Обрати
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


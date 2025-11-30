const API_URL = "http://localhost:5000/api";

export const registerUser = async ({ nickname, email, password, birthday }) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, email, password, birthday })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Registration failed");
    }

    const data = await response.json();
    return data;
};

export const loginUser = async ({ login, password }) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Login failed");
    }

    const data = await response.json();
    return data;
};

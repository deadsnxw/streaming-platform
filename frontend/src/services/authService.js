import { fetchAPI } from './api.js';

export const authService = {
    register: async (userData) => {
        try {
            const data = await fetchAPI('/auth/register', {
                method: 'POST',
                body: userData,
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    },

    login: async (credentials) => {
        try {
            const data = await fetchAPI('/auth/login', {
                method: 'POST',
                body: credentials,
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Проверка текущего пользователя через API
    checkAuth: async () => {
        try {
            const data = await fetchAPI('/auth/me', {
                method: 'GET',
            });
            return data;
        } catch (error) {
            authService.logout();
            throw error;
        }
    }
};
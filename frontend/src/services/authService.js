import { fetchAPI } from './api.js';

export const authService = {
    register: async (userData) => {
        const data = await fetchAPI('/auth/register', {
            method: 'POST',
            body: userData,
        });
        return data;
    },

    login: async (credentials) => {
        const data = await fetchAPI('/auth/login', {
            method: 'POST',
            body: credentials,
        });

        if (data.id) {
            localStorage.setItem('user', JSON.stringify(data));
        }

        return data;
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('user');
    }
};
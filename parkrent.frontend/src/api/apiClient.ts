import axios from 'axios';

export const API_URL = 'https://localhost:8081/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 &&
            window.location.pathname !== '/login' &&
            window.location.pathname !== '/register') {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};
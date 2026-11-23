import axios from 'axios';
import { notifyAccessDenied } from '../lib/accessDenied';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.pagePathname = window.location.pathname;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            const isLoginRoute = window.location.pathname === '/login';
            if (!isLoginRoute) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        if (status === 403) {
            const data = error.response.data;
            const message = data?.message || data?.erro;
            const pathname = error.config?.pagePathname ?? window.location.pathname;

            if (notifyAccessDenied(message, pathname)) {
                return new Promise(() => {});
            }
        }

        return Promise.reject(error);
    }
);

export default api;

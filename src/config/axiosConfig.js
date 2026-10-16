import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de request: injeta o token JWT automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response: redireciona para /login quando o token expira (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Evita redirect loop se já estiver na rota de login
            const isLoginRoute = window.location.pathname === '/login';
            if (!isLoginRoute) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

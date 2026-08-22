import axios from 'axios';
import Cookies from 'js-cookie';

export const google_login = () => {};

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_LIVEHOST,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            Cookies.remove('token');
            Cookies.remove('refreshToken');
            localStorage.removeItem('userRole');
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

export const api_calling = async (endpoint: string, body: any, customHeaders: Record<string, any> = {}) => {
    try {
        const response = await apiClient.post(endpoint, body, {
            headers: customHeaders,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

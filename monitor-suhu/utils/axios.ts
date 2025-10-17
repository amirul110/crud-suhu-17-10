import axios from 'axios';

// Create axios instance with base configuration
export const Axios = axios.create({
    baseURL: process.env.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
Axios.interceptors.request.use(
    (config) => {
        console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data
        });
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling responses
Axios.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
            status: error.response?.status,
            message: error.message,
            url: error.config?.url
        });
        return Promise.reject(error);
    }
);

export default Axios;
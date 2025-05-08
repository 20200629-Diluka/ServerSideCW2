import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercept requests to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API methods
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
};

// API Keys API methods
export const apiKeysAPI = {
    getAllKeys: () => api.get('/keys'),
    createKey: (keyData) => api.post('/keys', keyData),
    deleteKey: (keyId) => api.delete(`/keys/${keyId}`),
    toggleKey: (keyId) => api.patch(`/keys/${keyId}/toggle`),
    getKeyUsage: (keyId) => api.get(`/keys/${keyId}/usage`),
    getAllLogs: () => api.get('/keys/logs'),
};

// Countries API methods (requires API key in headers)
export const countriesAPI = {
    getCountryByName: (name, apiKey) => {
        //console.log('Making country by name API request with key:', apiKey);
        return axios.get(`${API_URL}/countries/name/${name}`, {
            headers: { 'x-api-key': apiKey }
        });
    },
};

export default api; 
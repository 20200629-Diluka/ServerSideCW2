import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from localstorage on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAPI.getProfile();
                    setUser(response.data.user);
                } catch (error) {
                    localStorage.removeItem('token');
                    console.error('Error loading user:', error);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Register a new user
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.register(userData);
            localStorage.setItem('token', response.data.token);

            // Get user data after successful registration
            const profileResponse = await authAPI.getProfile();
            setUser(profileResponse.data.user);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
            return { success: false, error: error.response?.data?.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.login(credentials);
            localStorage.setItem('token', response.data.token);

            // Get user data after successful login
            const profileResponse = await authAPI.getProfile();
            setUser(profileResponse.data.user);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
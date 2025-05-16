import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        // Set default axios headers
        axios.defaults.headers.common['x-auth-token'] = token;
        
        try {
          const res = await axios.get('/api/auth/user');
          
          if (res.data.success) {
            setUser(res.data.user);
            setIsAuthenticated(true);
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            delete axios.defaults.headers.common['x-auth-token'];
          }
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          delete axios.defaults.headers.common['x-auth-token'];
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['x-auth-token'];
      }
      
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: res.data.message || 'Registration failed'
        };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response && err.response.data.message 
          ? err.response.data.message 
          : 'Registration failed'
      };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: res.data.message || 'Login failed'
        };
      }
    } catch (err) {
      return { 
        success: false, 
        message: err.response && err.response.data.message 
          ? err.response.data.message 
          : 'Login failed'
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
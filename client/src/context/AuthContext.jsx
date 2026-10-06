import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('fitfuel_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setStats(data.stats);
    } catch (err) {
      localStorage.removeItem('fitfuel_token');
      localStorage.removeItem('fitfuel_user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('fitfuel_token', data.token);
      localStorage.setItem('fitfuel_user', JSON.stringify(data.user));
      setUser(data.user);
      setStats(data.stats);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await authAPI.register(userData);
      localStorage.setItem('fitfuel_token', data.token);
      localStorage.setItem('fitfuel_user', JSON.stringify(data.user));
      setUser(data.user);
      setStats(data.stats);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const googleLogin = async (googleProfile) => {
    try {
      setError(null);
      const { data } = await authAPI.googleLogin(googleProfile);
      localStorage.setItem('fitfuel_token', data.token);
      localStorage.setItem('fitfuel_user', JSON.stringify(data.user));
      setUser(data.user);
      setStats(data.stats);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('fitfuel_token');
    localStorage.removeItem('fitfuel_user');
    setUser(null);
    setStats(null);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, stats, loading, error,
      login, register, googleLogin, logout, updateUser, checkAuth, clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// mapp/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/me');
          const userData = response.data.user || response.data;
          setUser(userData);

          // توجيه تلقائي للمستخدم الحالي
          if (userData.role === 'admin') {
            router.replace('/(admin)/home');
          } else if (userData.role === 'student') {
            router.replace('/(student)/home');
          } else if (userData.role === 'instructor') {
            router.replace('/(doctor)/home');
          }
        }
      } catch (e) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (token && user) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        console.log('✅ Token saved:', token.substring(0, 30) + '...');

        setUser(user);

        // توجيه حسب الدور
        if (user.role === 'admin') {
          router.replace('/(admin)/home');
        } else if (user.role === 'student') {
          router.replace('/(student)/home');
        } else if (user.role === 'instructor') {
          router.replace('/(doctor)/home');
        } else {
          router.replace('/(auth)/login');
        }

        return { success: true, role: user.role };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.log('Login error:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    console.log('[Logout] Clearing user data');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 👇 غيرها لـ IP جهازك اللي ظهر في سيرفر الباكند
const API_BASE_URL = 'http://192.168.1.2:5000/api';
//const API_BASE_URL = ' https://struck-scarecrow-chimp.ngrok-free.dev';
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // لو حابب تlogout تلقائيًا
        }
        return Promise.reject(error);
    }
);
export { API_BASE_URL };

export default api;
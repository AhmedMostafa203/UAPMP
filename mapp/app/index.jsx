// mapp/app/index.jsx
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');

    console.log('Token exists:', !!token);  // 👈 أضف هذا
    console.log('User exists:', !!userStr);  // 👈 أضف هذا

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Parsed user:', user);  // 👈 أضف هذا

        if (user.role === 'student') {
          router.replace('/(student)/home');
        } else if (user.role === 'instructor' || user.role === 'doctor') {
          router.replace('/(doctor)/home');
        } else if (user.role === 'admin') {
          router.replace('/(admin)/home');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (e) {
        router.replace('/(auth)/login');
      }
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
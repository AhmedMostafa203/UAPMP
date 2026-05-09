// // mapp/app/_layout.jsx
// import { Stack } from 'expo-router';
// import { AuthProvider } from '../context/AuthContext';
// import { ThemeProvider } from '../context/ThemeContext';

// export default function RootLayout() {
//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <Stack>
//           {/* الصفحات الرئيسية */}
//           <Stack.Screen name="index" options={{ headerShown: false }} />

//           {/* Auth group - تسجيل الدخول */}
//           <Stack.Screen name="(auth)/login" options={{ title: 'تسجيل الدخول' }} />
//           <Stack.Screen name="(auth)/signup" options={{ title: 'إنشاء حساب' }} />

//           {/* Student group */}
//           <Stack.Screen name="(student)/home" options={{ title: 'الرئيسية' }} />
//           <Stack.Screen name="(student)/classes" options={{ title: 'المحاضرات' }} />
//           <Stack.Screen name="(student)/announcements" options={{ title: 'الإعلانات' }} />

//           {/* Doctor group */}
//           <Stack.Screen name="(doctor)/home" options={{ title: 'الرئيسية' }} />
//           <Stack.Screen name="(doctor)/classes" options={{ title: 'المحاضرات' }} />

//           {/* Admin group - اختياري */}
//           <Stack.Screen name="(admin)" options={{ headerShown: false }} />
//         </Stack>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// }


import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
//import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
//import { registerForPushNotificationsAsync } from '../services/notifications';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();

  // useEffect(() => {
  //   //registerForPushNotificationsAsync();

  //   // Handle notification when app is in foreground
  //   const subscription = Notifications.addNotificationReceivedListener(notification => {
  //     console.log('Notification received:', notification);
  //   });

  // Handle notification when app is opened from notification
  //   const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
  //     const data = response.notification.request.content.data;
  //     if (data.type === 'announcement') {
  //       router.push('/(student)/announcements');
  //     } else if (data.type === 'class-announcement' && data.classId) {
  //       router.push(`/(student)/class-details?id=${data.classId}`);
  //     } else if (data.type === 'admin-announcement') {
  //       router.push('/(admin)/announcements');
  //     } else if (data.type === 'doctor-announcement') {
  //       router.push('/(doctor)/announcements');
  //     }
  //   });

  //   return () => {
  //     subscription.remove();
  //     responseSubscription.remove();
  //   };
  // }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack>
          {/* الصفحات الرئيسية */}
          <Stack.Screen name="index" options={{ headerShown: false }} />

          {/* Auth group - تسجيل الدخول */}
          <Stack.Screen name="(auth)/login" options={{ title: 'تسجيل الدخول' }} />
          <Stack.Screen name="(auth)/signup" options={{ title: 'إنشاء حساب' }} />

          {/* Student group */}
          <Stack.Screen name="(student)/home" options={{ title: 'الرئيسية' }} />
          <Stack.Screen name="(student)/classes" options={{ title: 'المحاضرات' }} />
          <Stack.Screen name="(student)/announcements" options={{ title: 'الإعلانات' }} />
          <Stack.Screen name="(student)/class-details" options={{ title: 'تفاصيل المحاضرة' }} />

          {/* Doctor group */}
          <Stack.Screen name="(doctor)/home" options={{ title: 'الرئيسية' }} />
          <Stack.Screen name="(doctor)/classes" options={{ title: 'المحاضرات' }} />
          <Stack.Screen name="(doctor)/announcements" options={{ title: 'الإعلانات' }} />
          <Stack.Screen name="(doctor)/class-details" options={{ title: 'تفاصيل المحاضرة' }} />

          {/* Admin group */}
          <Stack.Screen name="(admin)/home" options={{ title: 'لوحة التحكم' }} />
          <Stack.Screen name="(admin)/announcements" options={{ title: 'الإعلانات' }} />
          <Stack.Screen name="(admin)/classes" options={{ title: 'الكلاسات' }} />
          <Stack.Screen name="(admin)/users" options={{ title: 'المستخدمين' }} />

          {/* hammad screens - اختياري */}
          <Stack.Screen name="hammad/NotIDOC" options={{ title: 'إشعارات' }} />
          <Stack.Screen name="hammad/NotSTD" options={{ title: 'إشعارات' }} />
          <Stack.Screen name="hammad/NotofAdmin" options={{ title: 'إشعارات' }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
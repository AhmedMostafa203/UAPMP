// mapp/app/(auth)/login.jsx

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,      // 👈 تأكد إنه موجود
  SafeAreaView,
  Alert,
  ActivityIndicator
} from "react-native";




import React, { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  console.log('LoginScreen rendered');  // 👈 أضف هذا

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    console.log('handleLogin called');  // 👈 أضف هذا

    if (!email || !password) {
      alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // ✅ التوجيه حسب الدور (role)
      if (result.role === 'student') {
        router.replace('/(student)/home');
      } else if (result.role === 'instructor' || result.role === 'doctor') {
        router.replace('/(doctor)/home');
      } else if (result.role === 'admin') {
        router.replace('/(admin)/home');
      }
    } else {
      alert(result.message);
    }
  };






  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🏛️</Text>
        </View>
        <Text style={styles.logoText}>UAPMP</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>تسجيل الدخول</Text>
        <Text style={styles.subtitle}>أدخل بياناتك الأكاديمية للوصول إلى البوابة</Text>

        <Text style={styles.label}>البريد الإلكتروني الجامعي</Text>
        <TextInput
          placeholder="student@std.fci.cu.edu.eg"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>دخول</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => {/* forgot password */ }}>
          <Text style={styles.link}>نسيت كلمة المرور؟</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.smallText}>ليس لديك حساب؟</Text>
        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.signupText}>إنشاء حساب</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.googleLoginRedirect}
          onPress={() => router.push('/(auth)/google-login')}
        >
          <Text style={styles.googleLoginRedirectText}>تسجيل الدخول بـ Google</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// الـ styles زي ما هي، بس ممكن تزود:
// textAlign: 'right' للعربية

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9ff",
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  iconBox: {
    width: 64,
    height: 64,
    backgroundColor: "#fff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
  },
  icon: { fontSize: 28 },
  logoText: { fontSize: 22, fontWeight: "800" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 5 },
  subtitle: { fontSize: 13, color: "#666", marginBottom: 20 },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 10,
    color: "#555",
  },
  input: {
    backgroundColor: "#f2f3fd",
    padding: 14,
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#1a73e8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  link: {
    textAlign: "center",
    marginTop: 10,
    color: "#1a73e8",
    fontWeight: "600",
  },
  bottom: { marginTop: 25, alignItems: "center" },
  smallText: { fontSize: 12, marginBottom: 10, color: "#777" },
  signupBtn: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  signupText: { color: "#1a73e8", fontWeight: "bold" },
});
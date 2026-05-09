// mapp/app/(auth)/signup.jsximport 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import api from '../../services/api';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔍 دالة تحديد الدور بناءً على صيغة الإيميل
  const getRoleFromEmail = (email) => {
    // الدكتور: الإيميل بيبدا بحرفين على الاقل ومفيش ارقام
    // مثال: dr.ahmed@fci.cu.edu.eg , mohamed.ali@fci.cu.edu.eg
    const doctorPattern = /^[a-zA-Z.]+@fci\.cu\.edu\.eg$/;

    // الطالب: الإيميل فيه ارقام (رقم جلوس او ID)
    // مثال: 20231145@std.fci.cu.edu.eg , student123@std.fci.cu.edu.eg
    const studentPattern = /@std\.fci\.cu\.edu\.eg$/;

    if (studentPattern.test(email)) {
      return 'student';
    } else if (doctorPattern.test(email)) {
      return 'doctor';
    }
    return null; // صيغة غير معروفة
  };

  // التحقق من صيغة الإيميل وإعطاء رسالة مناسبة
  const validateEmail = () => {
    if (!email) return false;

    const role = getRoleFromEmail(email);

    if (role === 'student') {
      return true;
    } else if (role === 'doctor') {
      return true;
    } else {
      alert("البريد الإلكتروني غير صحيح. استخدم:\n• للطلاب: username@std.fci.cu.edu.eg (يجب وجود أرقام)\n• للدكاترة: name@fci.cu.edu.eg (بدون أرقام)");
      return false;
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert("جميع الحقول مطلوبة");
      return;
    }

    if (password !== confirmPassword) {
      alert("كلمات المرور غير متطابقة");
      return;
    }

    if (password.length < 6) {
      alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (!validateEmail()) {
      return;
    }

    // 🎯 تحديد الدور تلقائياً من الإيميل
    const role = getRoleFromEmail(email);

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName: fullName,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        role: role,
        isVerified: role === 'doctor' ? true : false // الدكتور مفعل تلقائياً
      });

      if (response.status === 201) {
        if (role === 'doctor') {
          alert("✅ تم إنشاء حساب الدكتور بنجاح! يمكنك تسجيل الدخول مباشرة.");
          router.replace('/(auth)/login');
        } else {
          alert("📧 تم إنشاء حساب الطالب بنجاح. يرجى تفعيل حسابك عبر البريد الإلكتروني.");
          router.replace('/(auth)/login');
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>إنشاء حساب</Text>

        <Text style={styles.subTitle}>
          أدخل بريدك الجامعي من جامعة القاهرة
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📌 ملاحظة:</Text>
          <Text style={styles.infoText}>
            • الطلاب: بريد يحتوي على أرقام وينتهي بـ @std.fci.cu.edu.eg
          </Text>
          <Text style={styles.infoText}>
            • الدكاترة: بريد بدون أرقام وينتهي بـ @fci.cu.edu.eg
          </Text>
          <Text style={styles.infoExample}>
            مثال طالب: 20231145@std.fci.cu.edu.eg
          </Text>
          <Text style={styles.infoExample}>
            مثال دكتور: ahmed.ali@fci.cu.edu.eg
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            placeholderTextColor="#999"
            onChangeText={setFullName}
            value={fullName}
            textAlign="right"
          />

          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني الجامعي"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
            textAlign="right"
          />

          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            textAlign="right"
          />

          <TextInput
            style={styles.input}
            placeholder="تأكيد كلمة المرور"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            textAlign="right"
          />
        </View>

        {/* عرض نوع الحساب المتوقع بشكل حي */}
        {email.length > 0 && (
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>
              {getRoleFromEmail(email) === 'student' && '🎓 سيتم إنشاء حساب طالب (يحتاج تفعيل)'}
              {getRoleFromEmail(email) === 'doctor' && '👨‍🏫 سيتم إنشاء حساب دكتور (مفعل تلقائياً)'}
              {getRoleFromEmail(email) === null && email.length > 5 && '⚠️ صيغة البريد غير معروفة'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>تسجيل الحساب</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.back()}
        >
          <Text style={styles.loginLinkText}>
            لديك حساب بالفعل؟ تسجيل الدخول
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { padding: 20, justifyContent: 'center', flexGrow: 1 },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10
  },

  subTitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },

  infoCard: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    textAlign: 'right',
  },
  infoExample: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
  },

  inputContainer: { marginBottom: 20 },
  input: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    fontSize: 15,
    color: '#333'
  },

  previewBox: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  previewText: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: '500',
  },

  signUpButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#4A90E2',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
});
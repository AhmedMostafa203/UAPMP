import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

export default function JoinClass() {
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            Alert.alert('تنبيه', 'الرجاء إدخال كود الانضمام');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/classes/join', {
                joinCode: joinCode.toUpperCase().trim()
            });

            if (response.data.code === 'CLASS_JOINED') {
                Alert.alert('نجاح', `تم الانضمام إلى الكلاس بنجاح`);
                router.back();
            }
        } catch (error) {
            Alert.alert('خطأ', error.response?.data?.message || 'كود غير صحيح');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>الانضمام إلى كلاس</Text>
            <Text style={styles.subtitle}>أدخل الكود المفتاحي من دكتورك</Text>

            <TextInput
                style={styles.input}
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="مثال: 6E7F34"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                textAlign="center"
            />

            <TouchableOpacity style={styles.button} onPress={handleJoin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'جاري...' : 'انضمام'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },
    input: {
        borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
        padding: 15, fontSize: 20, textAlign: 'center', letterSpacing: 2
    },
    button: { backgroundColor: '#2563EB', padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, ScrollView, StyleSheet,
    TouchableOpacity, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);

    const { colors: c, dark, toggleDark } = useTheme();
    const router = useRouter();

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
            setUsers([]);
            setHasMore(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch users from admin endpoint (not auth)
    const fetchUsers = useCallback(async (reset = false) => {
        console.log('🔄 fetchUsers called, reset:', reset, 'page:', page);

        if (loading) return;
        const token = await AsyncStorage.getItem('token');
        console.log('🔑 Token in fetchUsers:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');

        const currentPage = reset ? 1 : page;
        if (!reset && !hasMore) return;

        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: {
                    page: currentPage,
                    limit: 20,
                    search: debouncedSearch,
                }
            });

            if (response.data.success) {
                const newUsers = response.data.users;
                setUsers(prev => reset ? newUsers : [...prev, ...newUsers]);
                setTotalUsers(response.data.pagination.totalItems);
                setHasMore(response.data.pagination.hasNextPage);
                setPage(currentPage + 1);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
            Alert.alert('خطأ', 'فشل تحميل المستخدمين');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, hasMore, loading, debouncedSearch]);

    // Initial load and when search changes
    useEffect(() => {
        console.log('🔄 useEffect triggered, debouncedSearch:', debouncedSearch);

        fetchUsers(true);
    },);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchUsers(true);
    },);

    const loadMore = () => {
        if (!loading && hasMore && !refreshing) {
            fetchUsers();
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        Alert.alert(
            'تأكيد الحذف',
            `هل أنت متأكد من حذف "${userName}"؟`,
            [
                { text: 'إلغاء', style: 'cancel' },
                {
                    text: 'حذف',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/users/${userId}`);
                            Alert.alert('نجاح', 'تم حذف المستخدم');
                            // Reset and refresh
                            setPage(1);
                            setHasMore(true);
                            fetchUsers(true);
                        } catch (error) {
                            Alert.alert('خطأ', error.response?.data?.message || 'فشل الحذف');
                        }
                    }
                }
            ]
        );
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return '#dc2626';
            case 'instructor': return '#16a34a';
            case 'student': return '#2563eb';
            default: return '#6b7280';
        }
    };

    const getRoleName = (role) => {
        switch (role) {
            case 'admin': return 'أدمن';
            case 'instructor': return 'دكتور';
            case 'student': return 'طالب';
            default: return role;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={[styles.backIcon, { color: c.text }]}>←</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: c.text }]}>المستخدمين</Text>
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.bg }]} onPress={toggleDark}>
                    <Text style={styles.iconBtnText}>{dark ? '☀️' : '🌙'}</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: c.card, borderColor: c.border }]}>
                <TextInput
                    style={[styles.searchInput, { color: c.text }]}
                    placeholder="🔍 بحث بالاسم أو الإيميل..."
                    placeholderTextColor={c.subText}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Text style={styles.clearBtn}>✖️</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Stats */}
            <View style={styles.statsBar}>
                <Text style={[styles.statsText, { color: c.subText }]}>
                    إجمالي المستخدمين: {totalUsers}
                </Text>
            </View>

            {/* Users List */}
            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
                }
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
                    if (isEnd && !loading && hasMore) loadMore();
                }}
                scrollEventThrottle={16}
            >
                {loading && users.length === 0 ? (
                    <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
                ) : users.length === 0 ? (
                    <Text style={{ color: c.subText, textAlign: 'center', marginTop: 40 }}>لا يوجد مستخدمين</Text>
                ) : (
                    users.map((user) => (
                        <View key={user._id} style={[styles.userCard, { backgroundColor: c.card }]}>
                            <View style={styles.userHeader}>
                                <View style={[styles.avatar, { backgroundColor: getRoleBadgeColor(user.role) }]}>
                                    <Text style={styles.avatarText}>{user.fullName?.charAt(0) || '?'}</Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={[styles.userName, { color: c.text }]}>{user.fullName}</Text>
                                    <Text style={[styles.userEmail, { color: c.subText }]}>{user.email}</Text>
                                </View>
                                <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                                    <Text style={[styles.roleText, { color: getRoleBadgeColor(user.role) }]}>
                                        {getRoleName(user.role)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.userFooter}>
                                <Text style={[styles.userMeta, { color: c.subText }]}>
                                    🆔 {user.studentId || 'N/A'} • 📅 {new Date(user.createdAt).toLocaleDateString()}
                                </Text>
                                {user.role !== 'admin' && (
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => handleDeleteUser(user._id, user.fullName)}
                                    >
                                        <Text style={styles.deleteBtnText}>🗑️ حذف</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
                {loading && users.length > 0 && (
                    <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 20 }} />
                )}
                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
    backBtn: { padding: 4 },
    backIcon: { fontSize: 22, fontWeight: '800' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    iconBtnText: { fontSize: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 12, borderWidth: 1, borderRadius: 12 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 16 },
    clearBtn: { padding: 8, fontSize: 16 },
    statsBar: { paddingHorizontal: 16, marginBottom: 8 },
    statsText: { fontSize: 14, fontWeight: '500' },
    scroll: { padding: 16, paddingTop: 0 },
    userCard: { borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
    userHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    avatar: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: 'bold' },
    userEmail: { fontSize: 13, marginTop: 2 },
    roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    roleText: { fontSize: 11, fontWeight: 'bold' },
    userFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e5e5e5' },
    userMeta: { fontSize: 11 },
    deleteBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    deleteBtnText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
});
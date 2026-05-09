import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const FILTERS = ['All Categories', 'Computer Science', 'Engineering', 'Mathematics', 'Design & Arts', 'Humanities', 'Business'];

export default function StudentClasses() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Categories');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors: c, dark, toggleDark } = useTheme();
  const { logout, user } = useAuth();
  const router = useRouter();

  // جلب الكلاسات اللي الطالب منضم ليها
  const fetchEnrolledClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/my');
      if (response.data.code === 'CLASSES_FETCHED') {
        // تحويل البيانات من الباكند للشكل المطلوب في الـ UI
        const formattedClasses = response.data.classes.map(cls => ({
          id: cls._id,
          code: cls.courseCode,
          name: cls.name,
          desc: cls.description || 'No description',
          doctor: cls.instructor?.fullName || 'Dr. Instructor',
          dept: cls.section || 'Department',
          rating: 4.5, // مؤقت
          students: cls.students?.length || 0,
          category: 'Computer Science', // مؤقت
          image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80',
          joined: true, // الطالب منضم فعلاً
          joinCode: cls.joinCode,
        }));
        setClasses(formattedClasses);
      }
    } catch (error) {
      console.error('Fetch classes error:', error);
      Alert.alert('Error', 'Failed to load your classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledClasses();
  }, []);

  const handleLeave = async (classId, className) => {
    Alert.alert(
      'Leave Class',
      `Are you sure you want to leave "${className}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/classes/leave/${classId}`);
              Alert.alert('Success', `You left ${className}`);
              fetchEnrolledClasses(); // تحديث القائمة
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to leave class');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: c.text }}>Loading your classes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>

      {/* Sidebar */}
      {menuOpen && (
        <View style={styles.sidebarWrap}>
          <TouchableOpacity style={styles.overlay} onPress={() => setMenuOpen(false)} />
          <View style={[styles.sidebar, { backgroundColor: c.card }]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.logoSmall}>
                <Text style={styles.logoSmallText}>🎓</Text>
              </View>
              <View>
                <Text style={[styles.logoName, { color: c.text }]}>UAPMP</Text>
                <Text style={[styles.logoSub, { color: c.subText }]}>Student Portal</Text>
              </View>
            </View>
            {[
              { icon: '🏠', label: 'Home', route: '/(student)/home' },
              { icon: '📚', label: 'Courses', active: true },
              { icon: '⭐', label: 'Grades' },
              { icon: '📅', label: 'Schedule' },
              //{ icon: '💬', label: 'Announcements', route: '/(student)/announcements' },
              { icon: '⚙️', label: 'Settings' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sidebarItem, item.active && { backgroundColor: '#2563eb22' }]}
                onPress={() => { setMenuOpen(false); if (item.route) router.push(item.route); }}
              >
                <Text style={styles.sidebarIcon}>{item.icon}</Text>
                <Text style={[styles.sidebarLabel, { color: item.active ? '#2563eb' : c.text }]}>{item.label}</Text>
                {item.active && <View style={styles.sidebarDot} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.sidebarItem, { marginTop: 20, borderTopWidth: 1, borderTopColor: c.border }]}
              onPress={logout}
            >
              <Text style={styles.sidebarIcon}>🚪</Text>
              <Text style={[styles.sidebarLabel, { color: '#dc2626' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.hamburger}>
          <View style={[styles.hLine, { backgroundColor: c.text }]} />
          <View style={[styles.hLine, { backgroundColor: c.text, width: 16 }]} />
          <View style={[styles.hLine, { backgroundColor: c.text, width: 10 }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>My Classes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.bg }]} onPress={() => router.push('/hammad/NotSTD')}>
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.bg }]} onPress={toggleDark}>
            <Text style={styles.iconBtnText}>{dark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>My Enrolled Classes</Text>
          <Text style={styles.bannerSub}>
            You are enrolled in {classes.length} {classes.length === 1 ? 'class' : 'classes'}
          </Text>
        </View>

        {/* Classes List */}
        {classes.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: c.card }]}>
            <Text style={[styles.emptyText, { color: c.text }]}>No classes yet</Text>
            <Text style={[styles.emptySubText, { color: c.subText }]}>
              Ask your instructor for a join code and tap "Join a Class" on the home screen
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classCard, { backgroundColor: c.card }]}
                onPress={() => router.push(`/(student)/class-details?id=${cls.id}`)}
                activeOpacity={0.9}
              >
                <View style={styles.imageWrap}>
                  <Image source={{ uri: cls.image }} style={styles.classImage} resizeMode="cover" />
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{cls.code}</Text>
                  </View>
                  <View style={styles.joinedBadge}>
                    <Text style={styles.joinedText}>✓ Enrolled</Text>
                  </View>
                </View>
                <View style={styles.classBody}>
                  <Text style={[styles.className, { color: c.text }]}>{cls.name}</Text>
                  <Text style={[styles.classDesc, { color: c.subText }]} numberOfLines={2}>{cls.desc}</Text>
                  <View style={styles.doctorRow}>
                    <View style={styles.doctorAvatar}>
                      <Text style={styles.doctorAvatarText}>{cls.doctor?.[3] || 'D'}</Text>
                    </View>
                    <View>
                      <Text style={[styles.doctorName, { color: c.text }]}>{cls.doctor}</Text>
                      <Text style={[styles.doctorDept, { color: c.subText }]}>{cls.dept}</Text>
                    </View>
                  </View>
                  <View style={styles.cardBottom}>
                    <View style={styles.ratingRow}>
                      <Text style={styles.star}>🔑</Text>
                      <Text style={[styles.ratingVal, { color: '#2563eb', fontFamily: 'monospace' }]}>{cls.joinCode}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.joinBtnLeave}
                      onPress={() => handleLeave(cls.id, cls.name)}
                    >
                      <Text style={styles.joinBtnTextLeave}>Leave</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  sidebarWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 260, padding: 24, elevation: 20, paddingTop: 50 },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 30 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, borderRadius: 12, marginBottom: 4 },
  sidebarIcon: { fontSize: 20 },
  sidebarLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  sidebarDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb' },
  header: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, borderBottomWidth: 1 },
  hamburger: { gap: 5, padding: 4 },
  hLine: { height: 2.5, width: 22, borderRadius: 2 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16 },
  logoSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  logoSmallText: { fontSize: 18 },
  logoName: { fontSize: 15, fontWeight: '900' },
  logoSub: { fontSize: 11 },
  scroll: { padding: 16 },
  banner: { backgroundColor: '#2563eb', borderRadius: 20, padding: 24, marginBottom: 16 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: 'white', marginBottom: 8 },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  grid: { gap: 16 },
  classCard: { borderRadius: 20, overflow: 'hidden', elevation: 3 },
  imageWrap: { position: 'relative' },
  classImage: { width: '100%', height: 160 },
  codeBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  codeText: { color: 'white', fontSize: 11, fontWeight: '800' },
  joinedBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  joinedText: { color: 'white', fontSize: 11, fontWeight: '700' },
  classBody: { padding: 16 },
  className: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  classDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  doctorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  doctorAvatarText: { color: 'white', fontSize: 14, fontWeight: '800' },
  doctorName: { fontSize: 13, fontWeight: '700' },
  doctorDept: { fontSize: 11, marginTop: 1 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 14 },
  ratingVal: { fontSize: 14, fontWeight: '700' },
  ratingCount: { fontSize: 12 },
  joinBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  joinBtnLeave: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  joinBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
  joinBtnTextLeave: { color: '#dc2626', fontSize: 13, fontWeight: '700' },
  emptyContainer: { padding: 40, borderRadius: 16, alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubText: { fontSize: 14, textAlign: 'center' },
});




import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
// app/(doctor)/home.jsx
import api from '../../services/api';  // 👈 أضف هذا السطر




export default function DoctorHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { colors: c, toggleDark, dark } = useTheme();
  const router = useRouter();
  const { logout, user } = useAuth();
  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const handleNotifications = () => {
    router.push('/hammad/NotIDOC');  // 👈 إشعارات الدكتور
  };


  const [globalAnnouncements, setGlobalAnnouncements] = useState([]);

  useEffect(() => {
    fetchGlobalAnnouncements();
  }, []);

  const fetchGlobalAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setGlobalAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>

      {/* Sidebar Modal */}
      <Modal visible={menuOpen} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setMenuOpen(false)} />
        <View style={[styles.sidebar, { backgroundColor: c.card }]}>
          <View style={styles.sidebarHeader}>
            <View style={styles.logoSmall}>
              <Text style={styles.logoSmallText}>🎓</Text>
            </View>
            <View>
              <Text style={[styles.logoName, { color: c.text }]}>UAPMP</Text>
              <Text style={[styles.logoSub, { color: c.subText }]}>Instructor Portal</Text>
            </View>
          </View>

          {[
            { icon: '🏠', label: 'Home', active: true, route: '/(doctor)/home' },
            { icon: '📚', label: 'Classes', route: '/(doctor)/classes' },
            { icon: '👥', label: 'Students' },
            { icon: '📅', label: 'Schedule' },
            { icon: '📊', label: 'Reports' },
            { icon: '💬', label: 'Announcements', route: '/(doctor)/announcements' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.sidebarItem, item.active && { backgroundColor: '#2563eb22' }]}
              onPress={() => {
                setMenuOpen(false);
                if (item.route) router.push(item.route);
              }}
            >
              <Text style={styles.sidebarIcon}>{item.icon}</Text>
              <Text style={[styles.sidebarLabel, { color: item.active ? '#2563eb' : c.text }]}>
                {item.label}
              </Text>
              {item.active && <View style={styles.sidebarDot} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.sidebarItem, { marginTop: 20, borderTopWidth: 1, borderTopColor: c.border }]}
            onPress={handleLogout}
          >
            <Text style={styles.sidebarIcon}>🚪</Text>
            <Text style={[styles.sidebarLabel, { color: '#dc2626' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.hamburger}>
          <View style={[styles.hLine, { backgroundColor: c.text }]} />
          <View style={[styles.hLine, { backgroundColor: c.text, width: 16 }]} />
          <View style={[styles.hLine, { backgroundColor: c.text, width: 10 }]} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>Dashboard</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.bg }]}
            onPress={handleNotifications}
          >
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: c.bg }]}
            onPress={toggleDark}
          >
            <Text style={styles.iconBtnText}>{dark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {globalAnnouncements.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>📢 Announcements</Text>
            {globalAnnouncements.slice(0, 3).map((ann) => (
              <View key={ann._id} style={[styles.annCard, { backgroundColor: c.card, borderLeftWidth: 4, borderLeftColor: '#2563eb' }]}>
                <Text style={[styles.annTitle, { color: c.text, fontWeight: 'bold' }]}>{ann.title}</Text>
                <Text style={[styles.annMessage, { color: c.subText }]}>{ann.message}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👩‍🏫</Text>
            </View>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeName}>Good Evening, Professor Smith 👋</Text>
              <Text style={styles.welcomeSub}>You have 2 classes and 3 pending tasks for today.</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>3</Text>
              <Text style={styles.statLbl}>Active Classes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>125</Text>
              <Text style={styles.statLbl}>Students</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>85%</Text>
              <Text style={styles.statLbl}>Avg Attendance</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Students', val: '145', icon: '👥', badge: '+2.5%', badgeColor: '#16a34a' },
            { label: 'Avg Attendance', val: '87%', icon: '✅', badge: '+1.2%', badgeColor: '#16a34a' },
            { label: 'To Grade', val: '12', icon: '⭐', badge: 'Pending', badgeColor: '#d97706' },
            { label: 'At Risk', val: '3', icon: '⚠️', badge: 'Alert', badgeColor: '#dc2626' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: c.card }]}>
              <View style={styles.statCardTop}>
                <Text style={styles.statCardIcon}>{s.icon}</Text>
                <Text style={[styles.statCardBadge, { color: s.badgeColor }]}>{s.badge}</Text>
              </View>
              <Text style={[styles.statCardLabel, { color: c.subText }]}>{s.label}</Text>
              <Text style={[styles.statCardVal, { color: c.text }]}>{s.val}</Text>
            </View>
          ))}
        </View>

        {/* Active Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Active Courses</Text>
            <TouchableOpacity onPress={() => router.push('/(doctor)/classes')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {[
            { id: 1, code: 'CS101', name: 'Intro to Algorithms', time: 'Mon/Wed, 10:00 AM', room: 'Room 304', students: 42, status: 'ACTIVE', statusColor: '#dcfce7', statusTextColor: '#15803d' },
            { id: 2, code: 'MAT202', name: 'Linear Algebra', time: 'Tue/Thu, 2:00 PM', room: 'Room 105', students: 28, status: 'ACTIVE', statusColor: '#dcfce7', statusTextColor: '#15803d' },
            { id: 3, code: 'CS450', name: 'Web Dev Capstone', time: 'Fri, 9:00 AM', room: 'Room 201', students: 35, status: 'PAUSED', statusColor: '#fef3c7', statusTextColor: '#d97706' },
          ].map((cls, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.classCard, { backgroundColor: c.card }]}
              onPress={() => router.push(`/(doctor)/class-details?id=${cls.id}`)}
            >
              <View style={styles.classCardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.className, { color: c.text }]}>{cls.name}</Text>
                  <Text style={[styles.classSub, { color: c.subText }]}>{cls.code}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cls.statusColor }]}>
                  <Text style={[styles.statusText, { color: cls.statusTextColor }]}>{cls.status}</Text>
                </View>
              </View>
              <View style={styles.classCardBottom}>
                <Text style={[styles.classMeta, { color: c.subText }]}>🕐 {cls.time}</Text>
                <Text style={[styles.classMeta, { color: c.subText }]}>📍 {cls.room}</Text>
                <Text style={[styles.classMeta, { color: c.subText }]}>👥 {cls.students} Students</Text>
              </View>
              <View style={styles.gradeBtn}>
                <Text style={styles.gradeBtnText}>View Class Details</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Today's Schedule</Text>
          <View style={[styles.card, { backgroundColor: c.card, marginTop: 10 }]}>
            {[
              { status: 'HAPPENING NOW', statusColor: '#16a34a', title: 'CS101 Lecture', sub: 'Room 304 • Algorithms', time: '10:00 - 11:30 AM' },
              { status: 'UPCOMING', statusColor: '#2563eb', title: 'Dept. Meeting', sub: 'Conference Room B', time: '02:00 - 03:30 PM' },
              { status: 'UPCOMING', statusColor: '#2563eb', title: 'Office Hours', sub: 'Office 201', time: '04:00 - 05:00 PM' },
            ].map((s, i) => (
              <View key={i} style={[
                styles.scheduleRow,
                i === 2 && { borderBottomWidth: 0 },
                { borderBottomColor: c.border }
              ]}>
                <View style={[styles.scheduleDot, { backgroundColor: s.statusColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scheduleStatus, { color: s.statusColor }]}>{s.status}</Text>
                  <Text style={[styles.scheduleTitle, { color: c.text }]}>{s.title}</Text>
                  <Text style={[styles.scheduleSub, { color: c.subText }]}>{s.sub}</Text>
                </View>
                <Text style={[styles.scheduleTime, { color: c.subText }]}>{s.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attendance Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Attendance Overview</Text>
          <View style={[styles.card, { backgroundColor: c.card, marginTop: 10 }]}>
            <Text style={[styles.attendanceBig, { color: c.text }]}>85%</Text>
            <Text style={[styles.attendanceAvg, { color: c.subText }]}>Average</Text>
            {[
              { code: 'CS101', pct: 92, color: '#16a34a' },
              { code: 'CS302', pct: 78, color: '#d97706' },
              { code: 'CS450', pct: 88, color: '#16a34a' },
            ].map((a, i) => (
              <View key={i} style={styles.attendanceRow}>
                <Text style={[styles.attendanceCode, { color: c.text }]}>{a.code}</Text>
                <View style={[styles.progressBg, { backgroundColor: c.border }]}>
                  <View style={[styles.progressFill, { width: `${a.pct}%`, backgroundColor: a.color }]} />
                </View>
                <Text style={[styles.attendancePct, { color: c.text }]}>{a.pct}%</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.attendanceBtn}>
              <Text style={styles.attendanceBtnText}>Take Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Tasks</Text>
            <Text style={{ color: '#dc2626', fontSize: 13, fontWeight: '700' }}>3 Pending</Text>
          </View>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            {[
              { name: 'Grade Final Papers', priority: 'High Priority', due: 'Due Tomorrow', dueColor: '#dc2626', done: false },
              { name: 'Approve Syllabus Changes', priority: 'Medium', due: 'Due Friday', dueColor: '#d97706', done: false },
              { name: 'Email Department Head', priority: '', due: 'Completed', dueColor: '#16a34a', done: true },
            ].map((t, i) => (
              <View key={i} style={[
                styles.taskRow,
                i === 2 && { borderBottomWidth: 0 },
                { borderBottomColor: c.border }
              ]}>
                <View style={[styles.taskCheck, { borderColor: t.done ? '#2563eb' : c.border, backgroundColor: t.done ? '#2563eb' : 'transparent' }]}>
                  {t.done && <Text style={{ color: 'white', fontSize: 10, fontWeight: '800' }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.taskName, { color: t.done ? c.subText : c.text, textDecorationLine: t.done ? 'line-through' : 'none' }]}>
                    {t.name}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 3 }}>
                    {t.priority !== '' && (
                      <Text style={[styles.taskPriority, { color: '#d97706' }]}>{t.priority}</Text>
                    )}
                    <Text style={[styles.taskDue, { color: t.dueColor }]}>{t.due}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {[
              { icon: '📊', label: 'Upload Grades' },
              { icon: '📢', label: 'Announcement' },
              { icon: '💬', label: 'Message Class' },
              { icon: '📅', label: 'Calendar' },
            ].map((q, i) => (
              <TouchableOpacity key={i} style={[styles.quickCard, { backgroundColor: c.card }]}>
                <Text style={styles.quickIcon}>{q.icon}</Text>
                <Text style={[styles.quickLabel, { color: c.text }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: { flex: 1 },
  overlay: {
    position: 'absolute', top: 0, left: 0,
    right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    position: 'absolute', top: 0, left: 0,
    bottom: 0, width: 260, padding: 24,
    elevation: 20, paddingTop: 50,
  },
  sidebarHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 30,
  },
  sidebarItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: 14, padding: 12, borderRadius: 12, marginBottom: 4,
  },
  sidebarIcon: { fontSize: 20 },
  sidebarLabel: { fontSize: 15, fontWeight: '600', flex: 1 },
  sidebarDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2563eb' },
  header: {
    padding: 14, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    elevation: 3, borderBottomWidth: 1,
  },
  hamburger: { gap: 5, padding: 4 },
  hLine: { height: 2.5, width: 22, borderRadius: 2 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 16 },
  logoSmall: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
  },
  logoSmallText: { fontSize: 18 },
  logoName: { fontSize: 15, fontWeight: '900' },
  logoSub: { fontSize: 11 },
  scroll: { padding: 16 },
  welcomeCard: {
    backgroundColor: '#2563eb', borderRadius: 20,
    padding: 20, marginBottom: 16,
  },
  welcomeTop: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 28 },
  welcomeInfo: { flex: 1, justifyContent: 'center' },
  welcomeName: { fontSize: 16, fontWeight: '900', color: 'white' },
  welcomeSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4, lineHeight: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  statVal: { fontSize: 18, fontWeight: '900', color: 'white' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '47%', borderRadius: 16, padding: 14, elevation: 2 },
  statCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statCardIcon: { fontSize: 22 },
  statCardBadge: { fontSize: 12, fontWeight: '700' },
  statCardLabel: { fontSize: 12, marginBottom: 4 },
  statCardVal: { fontSize: 24, fontWeight: '900' },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  viewAll: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  classCard: { borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2 },
  classCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  className: { fontSize: 14, fontWeight: '700' },
  classSub: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  classCardBottom: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  classMeta: { fontSize: 12 },
  gradeBtn: {
    backgroundColor: '#2563eb', borderRadius: 8,
    paddingVertical: 8, alignItems: 'center',
  },
  gradeBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  scheduleRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 12, borderBottomWidth: 1, gap: 12,
  },
  scheduleDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  scheduleStatus: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
  scheduleTitle: { fontSize: 14, fontWeight: '700' },
  scheduleSub: { fontSize: 12, marginTop: 2 },
  scheduleTime: { fontSize: 12, fontWeight: '600' },
  attendanceBig: { fontSize: 40, fontWeight: '900', textAlign: 'center' },
  attendanceAvg: { fontSize: 13, textAlign: 'center', marginBottom: 16 },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  attendanceCode: { fontSize: 12, fontWeight: '700', width: 45 },
  progressBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  attendancePct: { fontSize: 12, fontWeight: '700', width: 35, textAlign: 'right' },
  attendanceBtn: {
    backgroundColor: '#2563eb', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginTop: 14,
  },
  attendanceBtnText: { color: 'white', fontSize: 14, fontWeight: '700' },
  taskRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, gap: 12,
  },
  taskCheck: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  taskName: { fontSize: 13, fontWeight: '600' },
  taskPriority: { fontSize: 11, fontWeight: '700' },
  taskDue: { fontSize: 11, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  quickCard: {
    width: '47%', borderRadius: 16, padding: 16,
    alignItems: 'center', elevation: 2,
  },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: '700' },
  annCard: { borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  annTitle: { fontSize: 14, marginBottom: 4 },
  annMessage: { fontSize: 13 },
});

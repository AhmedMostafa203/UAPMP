import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';



export default function AdminHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { colors: c, toggleDark, dark } = useTheme();
  const router = useRouter();
  const { logout, user } = useAuth();
  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
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
              <Text style={[styles.logoSub, { color: c.subText }]}>Admin Console</Text>
            </View>
          </View>

          {[
            { icon: '🏠', label: 'Home', active: true, route: '/(admin)/home' },
            { icon: '💬', label: 'Announcements', route: '/(admin)/announcements' },
            { icon: '👥', label: 'Users' },
            { icon: '📚', label: 'Classes', route: '/(admin)/classes' },
            { icon: '📊', label: 'Reports' },
            { icon: '⚙️', label: 'Settings' },
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
            onPress={() => router.push('/hammad/NotofAdmin')} // السطر ده هو اللي هيعمل النقل
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

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👨‍💼</Text>
            </View>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeName}>Welcome back, Alexander! 👋</Text>
              <Text style={styles.welcomeSub}>
                You have{' '}
                <Text style={styles.welcomeHighlight}>5 pending approvals</Text>
                {' '}and{' '}
                <Text style={styles.welcomeHighlight}>12 new student registrations</Text>
                {' '}that require your attention today.
              </Text>
            </View>
          </View>
          <View style={styles.welcomeBtns}>
            <TouchableOpacity style={styles.welcomeBtn}>
              <Text style={styles.welcomeBtnText}>Review Pending Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.welcomeBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.welcomeBtnText}>Generate Weekly Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Statistics</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Total Students', val: '12,450', icon: '👥', badge: '↑ 2.5%', badgeColor: '#16a34a' },
              { label: 'Active Faculty', val: '842', icon: '👨‍🏫', badge: '↓ 0.4%', badgeColor: '#dc2626' },
              { label: 'Active Courses', val: '156', icon: '📚', badge: '↑ 1.2%', badgeColor: '#16a34a' },
              { label: 'Revenue Growth', val: '$1.2M', icon: '💰', badge: '↑ 4.8%', badgeColor: '#16a34a' },
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
        </View>

        {/* System Alerts */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>System Alerts</Text>
          <View style={{ gap: 10, marginTop: 10 }}>
            {[
              { icon: '⚠️', title: 'Server Maintenance', sub: 'Scheduled maintenance in 2 hours. Expect brief downtime.', bg: '#fef3c7', border: '#d97706', titleColor: '#d97706' },
              { icon: 'ℹ️', title: 'New Policy Draft', sub: 'Academic board has shared a new policy draft for review.', bg: '#eff6ff', border: '#2563eb', titleColor: '#2563eb' },
              { icon: 'ℹ️', title: 'Library Updates', sub: 'Digital library integration completed for the Humanities dept.', bg: '#eff6ff', border: '#2563eb', titleColor: '#2563eb' },
            ].map((alert, i) => (
              <View key={i} style={[styles.alertCard, { backgroundColor: alert.bg, borderLeftColor: alert.border }]}>
                <Text style={styles.alertIcon}>{alert.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { color: alert.titleColor }]}>{alert.title}</Text>
                  <Text style={[styles.alertSub, { color: c.subText }]}>{alert.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Registrations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Registrations</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            {[
              { name: 'Ahmed Mohamed', id: '20240001', major: 'Computer Science', status: 'Pending', statusColor: '#d97706', statusBg: '#fef3c7' },
              { name: 'Sara Ali', id: '20240002', major: 'Mathematics', status: 'Approved', statusColor: '#16a34a', statusBg: '#dcfce7' },
              { name: 'Omar Hassan', id: '20240003', major: 'Engineering', status: 'Pending', statusColor: '#d97706', statusBg: '#fef3c7' },
              { name: 'Nour Ibrahim', id: '20240004', major: 'Physics', status: 'Rejected', statusColor: '#dc2626', statusBg: '#fee2e2' },
            ].map((reg, i) => (
              <View key={i} style={[
                styles.regRow,
                i === 3 && { borderBottomWidth: 0 },
                { borderBottomColor: c.border }
              ]}>
                <View style={styles.regAvatar}>
                  <Text style={styles.regAvatarText}>{reg.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.regName, { color: c.text }]}>{reg.name}</Text>
                  <Text style={[styles.regSub, { color: c.subText }]}>{reg.id} • {reg.major}</Text>
                </View>
                <View style={[styles.regStatus, { backgroundColor: reg.statusBg }]}>
                  <Text style={[styles.regStatusText, { color: reg.statusColor }]}>{reg.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Users Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Users Overview</Text>
          <View style={[styles.card, { backgroundColor: c.card, marginTop: 10 }]}>
            {[
              { label: 'Students', val: 12450, total: 15000, color: '#2563eb' },
              { label: 'Faculty', val: 842, total: 1000, color: '#059669' },
              { label: 'Staff', val: 320, total: 500, color: '#7c3aed' },
            ].map((u, i) => (
              <View key={i} style={{ marginBottom: i === 2 ? 0 : 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={[styles.userLabel, { color: c.text }]}>{u.label}</Text>
                  <Text style={[styles.userVal, { color: c.subText }]}>{u.val.toLocaleString()} / {u.total.toLocaleString()}</Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: c.border }]}>
                  <View style={[styles.progressFill, { width: `${(u.val / u.total) * 100}%`, backgroundColor: u.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const lightColors = {
  bg: '#f0f4ff',
  card: '#ffffff',
  text: '#1e1b4b',
  subText: '#64748b',
  border: '#f0f0f0',
};

const darkColors = {
  bg: '#0f172a',
  card: '#1e293b',
  text: '#f1f5f9',
  subText: '#94a3b8',
  border: '#334155',
};

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
    padding: 20, marginBottom: 20,
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
  welcomeName: { fontSize: 16, fontWeight: '900', color: 'white', marginBottom: 6 },
  welcomeSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  welcomeHighlight: { fontWeight: '800', textDecorationLine: 'underline', color: 'white' },
  welcomeBtns: { flexDirection: 'row', gap: 10 },
  welcomeBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  welcomeBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  viewAll: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  statCard: { width: '47%', borderRadius: 16, padding: 14, elevation: 2 },
  statCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statCardIcon: { fontSize: 22 },
  statCardBadge: { fontSize: 12, fontWeight: '700' },
  statCardLabel: { fontSize: 12, marginBottom: 4 },
  statCardVal: { fontSize: 22, fontWeight: '900' },
  alertCard: {
    flexDirection: 'row', gap: 12, padding: 14,
    borderRadius: 12, borderLeftWidth: 4, alignItems: 'flex-start',
  },
  alertIcon: { fontSize: 20 },
  alertTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  alertSub: { fontSize: 12, lineHeight: 16 },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  regRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, gap: 12,
  },
  regAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
  },
  regAvatarText: { color: 'white', fontSize: 16, fontWeight: '800' },
  regName: { fontSize: 14, fontWeight: '700' },
  regSub: { fontSize: 12, marginTop: 2 },
  regStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  regStatusText: { fontSize: 11, fontWeight: '700' },
  userLabel: { fontSize: 13, fontWeight: '600' },
  userVal: { fontSize: 12 },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
});         
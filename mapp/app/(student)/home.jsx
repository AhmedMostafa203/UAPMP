import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function StudentHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState(0);
  const [grades, setGrades] = useState([]);
  const [missedClasses, setMissedClasses] = useState(0);
  const [globalAnnouncements, setGlobalAnnouncements] = useState([]);

  const { colors: c, dark, toggleDark } = useTheme();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  const handleNotifications = () => {
    router.push('/hammad/NotSTD');
  };

  const fetchGlobalAnnouncements = async () => {
    try {
      const response = await api.get('/announcements');
      setGlobalAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchGlobalAnnouncements();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <Modal visible={menuOpen} transparent animationType="slide">
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
            { icon: '🏠', label: 'Home', active: true, route: '/(student)/home' },
            { icon: '📚', label: 'Courses', route: '/(student)/classes' },
            { icon: '⭐', label: 'Grades' },
            { icon: '📅', label: 'Schedule' },
            { icon: '💬', label: 'Announcements', route: '/(student)/announcements' },
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
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.bg }]} onPress={toggleDark}>
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

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👨‍💻</Text>
            </View>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeName}>Welcome back, Alex!</Text>
              <Text style={styles.welcomeSub}>Computer Science Major • 3rd Year</Text>
              <Text style={styles.welcomeMeta}>ID: 20240912 • Last login: Today, 9:41 AM</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{courses.length}</Text>
              <Text style={styles.statLbl}>Courses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{attendance}%</Text>
              <Text style={styles.statLbl}>Attendance</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>N/A</Text>
              <Text style={styles.statLbl}>Avg Grade</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Enrolled Classes</Text>
            <TouchableOpacity onPress={() => router.push('/(student)/classes')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {courses.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center', width: 250 }}>
                <Text style={{ color: c.subText, textAlign: 'center', marginBottom: 10 }}>
                  You haven't joined any classes yet.
                </Text>
                <TouchableOpacity
                  style={[styles.courseBtn, { paddingHorizontal: 20 }]}
                  onPress={() => router.push('/join-class')}
                >
                  <Text style={styles.courseBtnText}>+ Join a Class</Text>
                </TouchableOpacity>
              </View>
            ) : (
              courses.map((course, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.courseCard, { backgroundColor: c.card }]}
                  onPress={() => course.active && router.push('/(student)/class-details')}
                  activeOpacity={course.active ? 0.8 : 1}
                >
                  <View style={[styles.courseTop, { backgroundColor: course.color }]}>
                    <Text style={styles.courseCode}>{course.code}</Text>
                  </View>
                  <View style={styles.courseBody}>
                    <Text style={[styles.courseName, { color: c.text }]}>{course.name}</Text>
                    <Text style={[styles.courseProf, { color: c.subText }]}>{course.prof}</Text>
                    <Text style={[styles.courseTime, { color: c.subText }]}>🕐 {course.time}</Text>
                    <View style={[styles.courseBtn, !course.active && { backgroundColor: c.bg }]}>
                      <Text style={[styles.courseBtnText, !course.active && { color: '#9ca3af' }]}>
                        {course.btn}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Pending Tasks</Text>
            <TouchableOpacity><Text style={styles.viewAll}>+ Add</Text></TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            {tasks.length === 0 ? (
              <View style={{ padding: 20 }}>
                <Text style={{ color: c.subText, textAlign: 'center' }}>No pending tasks! 🎉</Text>
              </View>
            ) : (
              tasks.map((task, i) => (
                <View key={i} style={[styles.taskRow, i === tasks.length - 1 && { borderBottomWidth: 0 }, { borderBottomColor: c.border }]}>
                  <View style={[styles.taskCheck, { borderColor: c.border }]} />
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskName, { color: c.text }]}>{task.name}</Text>
                    <View style={styles.taskMeta}>
                      <View style={[styles.priorityBadge, { backgroundColor: task.color }]}>
                        <Text style={[styles.priorityText, { color: task.textColor }]}>{task.priority}</Text>
                      </View>
                      <Text style={[styles.taskType, { color: c.subText }]}>{task.type}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Grades</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View Report Card</Text></TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            <View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
              <Text style={[styles.tableHead, { flex: 1 }]}>COURSE</Text>
              <Text style={[styles.tableHead, { flex: 2 }]}>ASSESSMENT</Text>
              <Text style={[styles.tableHead, { flex: 1 }]}>SCORE</Text>
              <Text style={[styles.tableHead, { flex: 1 }]}>GRADE</Text>
            </View>
            {grades.length === 0 ? (
              <View style={{ padding: 20 }}>
                <Text style={{ color: c.subText, textAlign: 'center' }}>No grades available yet.</Text>
              </View>
            ) : (
              grades.map((row, i) => (
                <View key={i} style={[styles.tableRow, i === grades.length - 1 && { borderBottomWidth: 0 }, { borderBottomColor: c.border }]}>
                  <Text style={[styles.tableCell, { flex: 1, fontWeight: '700', color: c.text }]}>{row.course}</Text>
                  <Text style={[styles.tableCell, { flex: 2, color: c.subText }]}>{row.assessment}</Text>
                  <Text style={[styles.tableCell, { flex: 1, color: c.subText }]}>{row.score}</Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={[styles.gradeBadge, { backgroundColor: row.color || '#2563eb22' }]}>
                      <Text style={[styles.gradeText, { color: row.textColor || '#2563eb' }]}>{row.grade}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Attendance</Text>
          <View style={[styles.card, { backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }]}>
            <View style={styles.attendanceCircle}>
              <Text style={styles.attendancePercent}>{attendance}%</Text>
            </View>
            <View>
              <Text style={[styles.attendanceTitle, { color: c.text }]}>Overall Attendance</Text>
              <Text style={[styles.attendanceSub, { color: c.subText }]}>
                {missedClasses === 0
                  ? "Perfect! You haven't missed any classes."
                  : `You missed ${missedClasses} classes this semester.`}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  welcomeCard: { backgroundColor: '#2563eb', borderRadius: 20, padding: 20, marginBottom: 20 },
  welcomeTop: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 28 },
  welcomeInfo: { flex: 1, justifyContent: 'center' },
  welcomeName: { fontSize: 18, fontWeight: '900', color: 'white' },
  welcomeSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  welcomeMeta: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: 'white' },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  viewAll: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  courseCard: { width: 160, borderRadius: 16, marginRight: 12, overflow: 'hidden', elevation: 3 },
  courseTop: { height: 80, padding: 10, justifyContent: 'flex-start' },
  courseCode: { backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  courseBody: { padding: 12 },
  courseName: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  courseProf: { fontSize: 11, marginBottom: 6 },
  courseTime: { fontSize: 11, marginBottom: 10 },
  courseBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  courseBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },
  card: { borderRadius: 16, padding: 16, elevation: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, gap: 12 },
  taskCheck: { width: 20, height: 20, borderRadius: 6, borderWidth: 2 },
  taskInfo: { flex: 1 },
  taskName: { fontSize: 13, fontWeight: '600' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  taskType: { fontSize: 10 },
  tableHeader: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, marginBottom: 4 },
  tableHead: { fontSize: 10, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  tableCell: { fontSize: 12 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  gradeText: { fontSize: 11, fontWeight: '700' },
  attendanceCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 7, borderColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  attendancePercent: { fontSize: 16, fontWeight: '900', color: '#2563eb' },
  attendanceTitle: { fontSize: 15, fontWeight: '700' },
  attendanceSub: { fontSize: 12, marginTop: 4 },
  annCard: { borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  annTitle: { fontSize: 14, marginBottom: 4 },
  annMessage: { fontSize: 13 },
});
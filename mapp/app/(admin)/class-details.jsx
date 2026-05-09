import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

const INITIAL_STUDENTS = [
  { id: 1, name: 'Ahmed Mohamed', studentId: '20240001', grade: 'B+', attendance: '92%' },
  { id: 2, name: 'Sara Ali', studentId: '20240002', grade: 'A', attendance: '98%' },
  { id: 3, name: 'Omar Hassan', studentId: '20240003', grade: 'C+', attendance: '75%' },
  { id: 4, name: 'Nour Ibrahim', studentId: '20240004', grade: 'A-', attendance: '88%' },
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: 'Midterm Review Session', body: 'The midterm review will take place this Friday at 4:00 PM in Hall B.', time: '2 HOURS AGO' },
  { id: 2, title: 'Lab 4 Submission Guidelines', body: 'Please ensure your Git repositories are public and README is updated.', time: 'YESTERDAY' },
];

export default function AdminClassDetails() {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [studentModal, setStudentModal] = useState(false);
  const [annModal, setAnnModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', studentId: '' });
  const [newAnn, setNewAnn] = useState({ title: '', body: '' });
  const { colors: c, dark, toggleDark } = useTheme();
  const router = useRouter();

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.studentId) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setStudents(prev => [...prev, {
      id: Date.now(), name: newStudent.name,
      studentId: newStudent.studentId, grade: 'N/A', attendance: '0%',
    }]);
    setNewStudent({ name: '', studentId: '' });
    setStudentModal(false);
    Alert.alert('Success! 👥', 'Student added successfully');
  };

  const handleDeleteStudent = (id, name) => {
    Alert.alert('Remove Student', `Remove ${name} from this class?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setStudents(prev => prev.filter(s => s.id !== id)) },
    ]);
  };

  const handleAddAnn = () => {
    if (!newAnn.title || !newAnn.body) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setAnnouncements(prev => [{
      id: Date.now(), title: newAnn.title,
      body: newAnn.body, time: 'JUST NOW',
    }, ...prev]);
    setNewAnn({ title: '', body: '' });
    setAnnModal(false);
    Alert.alert('Success! 📢', 'Announcement posted');
  };

  const handleDeleteAnn = (id) => {
    Alert.alert('Delete', 'Delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAnnouncements(prev => prev.filter(a => a.id !== id)) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>

      {/* Add Student Modal */}
      <Modal visible={studentModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>👥 Add Student</Text>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: c.subText }]}>Full Name</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
                placeholder="Student full name"
                placeholderTextColor={c.subText}
                value={newStudent.name}
                onChangeText={(v) => setNewStudent(p => ({ ...p, name: v }))}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: c.subText }]}>Student ID</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
                placeholder="e.g. 20240005"
                placeholderTextColor={c.subText}
                value={newStudent.studentId}
                onChangeText={(v) => setNewStudent(p => ({ ...p, studentId: v }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: c.border }]} onPress={() => setStudentModal(false)}>
                <Text style={[styles.modalCancelText, { color: c.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateBtn} onPress={handleAddStudent}>
                <Text style={styles.modalCreateText}>Add Student</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Announcement Modal */}
      <Modal visible={annModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>📢 New Announcement</Text>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: c.subText }]}>Title</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
                placeholder="Announcement title..."
                placeholderTextColor={c.subText}
                value={newAnn.title}
                onChangeText={(v) => setNewAnn(p => ({ ...p, title: v }))}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: c.subText }]}>Message</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.bg, color: c.text, borderColor: c.border, height: 100, textAlignVertical: 'top' }]}
                placeholder="Write your announcement..."
                placeholderTextColor={c.subText}
                value={newAnn.body}
                onChangeText={(v) => setNewAnn(p => ({ ...p, body: v }))}
                multiline
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: c.border }]} onPress={() => setAnnModal(false)}>
                <Text style={[styles.modalCancelText, { color: c.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateBtn} onPress={handleAddAnn}>
                <Text style={styles.modalCreateText}>Post Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: c.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Class Details</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.bg }]} onPress={toggleDark}>
          <Text style={styles.iconBtnText}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerBadges}>
          <View style={styles.badge}><Text style={styles.badgeText}>CS-101</Text></View>
          <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.badgeText, { color: '#15803d' }]}>ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.bannerTitle}>Intro to Computer Science</Text>
        <Text style={styles.bannerSub}>👨‍🏫 Dr. Marcus Sterling • Computer Science Dept.</Text>
        <View style={styles.bannerStats}>
          <View style={styles.bannerStat}>
            <Text style={styles.bannerStatVal}>{students.length}</Text>
            <Text style={styles.bannerStatLbl}>Students</Text>
          </View>
          <View style={styles.bannerStat}>
            <Text style={styles.bannerStatVal}>{announcements.length}</Text>
            <Text style={styles.bannerStatLbl}>Posts</Text>
          </View>
          <View style={styles.bannerStat}>
            <Text style={styles.bannerStatVal}>85%</Text>
            <Text style={styles.bannerStatLbl}>Attendance</Text>
          </View>
          <View style={styles.bannerStat}>
            <Text style={styles.bannerStatVal}>B+</Text>
            <Text style={styles.bannerStatLbl}>Avg Grade</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {[
          { key: 'overview', label: '📊 Overview' },
          { key: 'students', label: '👥 Students' },
          { key: 'announcements', label: '📢 Posts' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, { color: c.subText }, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View>
            {/* Quick Actions */}
            <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
            <View style={styles.quickGrid}>
              {[
                { icon: '👥', label: 'Add Student', onPress: () => { setActiveTab('students'); setStudentModal(true); } },
                { icon: '📢', label: 'Post Announcement', onPress: () => { setActiveTab('announcements'); setAnnModal(true); } },
                { icon: '⏸', label: 'Pause Class', onPress: () => Alert.alert('Class Paused', 'Class has been paused') },
                { icon: '🗑️', label: 'Delete Class', onPress: () => Alert.alert('Delete', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => router.back() }]) },
              ].map((q, i) => (
                <TouchableOpacity key={i} style={[styles.quickCard, { backgroundColor: c.card }]} onPress={q.onPress}>
                  <Text style={styles.quickIcon}>{q.icon}</Text>
                  <Text style={[styles.quickLabel, { color: c.text }]}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Grade Distribution */}
            <Text style={[styles.sectionTitle, { color: c.text, marginTop: 8 }]}>Grade Distribution</Text>
            <View style={[styles.card, { backgroundColor: c.card }]}>
              {[
                { grade: 'A', count: 12, color: '#15803d', pct: 27 },
                { grade: 'B', count: 18, color: '#2563eb', pct: 40 },
                { grade: 'C', count: 10, color: '#d97706', pct: 22 },
                { grade: 'D', count: 5, color: '#dc2626', pct: 11 },
              ].map((g, i) => (
                <View key={i} style={[styles.gradeRow, i === 3 && { borderBottomWidth: 0 }, { borderBottomColor: c.border }]}>
                  <View style={[styles.gradeBadge, { backgroundColor: g.color + '22' }]}>
                    <Text style={[styles.gradeLabel, { color: g.color }]}>{g.grade}</Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: c.border }]}>
                    <View style={[styles.progressFill, { width: `${g.pct}%`, backgroundColor: g.color }]} />
                  </View>
                  <Text style={[styles.gradeCount, { color: c.subText }]}>{g.count} students</Text>
                </View>
              ))}
            </View>

            {/* Attendance Overview */}
            <Text style={[styles.sectionTitle, { color: c.text, marginTop: 16 }]}>Attendance Overview</Text>
            <View style={[styles.card, { backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', gap: 16 }]}>
              <View style={styles.attendanceCircle}>
                <Text style={styles.attendancePercent}>85%</Text>
              </View>
              <View>
                <Text style={[styles.attendanceTitle, { color: c.text }]}>Overall Attendance</Text>
                <Text style={[styles.attendanceSub, { color: c.subText }]}>6 students below 75%</Text>
                <Text style={[styles.attendanceSub, { color: '#dc2626' }]}>⚠️ 3 at risk students</Text>
              </View>
            </View>
          </View>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setStudentModal(true)}>
              <Text style={styles.addBtnText}>+ Add Student</Text>
            </TouchableOpacity>
            <View style={[styles.card, { backgroundColor: c.card }]}>
              <View style={[styles.tableHeader, { borderBottomColor: c.border }]}>
                <Text style={[styles.tableHead, { flex: 2 }]}>NAME</Text>
                <Text style={[styles.tableHead, { flex: 1 }]}>GRADE</Text>
                <Text style={[styles.tableHead, { flex: 1 }]}>ATTEND.</Text>
                <Text style={[styles.tableHead, { flex: 0.5 }]}></Text>
              </View>
              {students.map((s, i) => (
                <View key={s.id} style={[
                  styles.studentRow,
                  i === students.length - 1 && { borderBottomWidth: 0 },
                  { borderBottomColor: c.border }
                ]}>
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>{s.name[0]}</Text>
                    </View>
                    <View>
                      <Text style={[styles.studentName, { color: c.text }]}>{s.name}</Text>
                      <Text style={[styles.studentId, { color: c.subText }]}>{s.studentId}</Text>
                    </View>
                  </View>
                  <Text style={[{ flex: 1, fontSize: 13, fontWeight: '700', color: c.text }]}>{s.grade}</Text>
                  <Text style={[{ flex: 1, fontSize: 13, color: c.subText }]}>{s.attendance}</Text>
                  <TouchableOpacity style={{ flex: 0.5, alignItems: 'center' }} onPress={() => handleDeleteStudent(s.id, s.name)}>
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAnnModal(true)}>
              <Text style={styles.addBtnText}>+ Post Announcement</Text>
            </TouchableOpacity>
            {announcements.map((ann) => (
              <View key={ann.id} style={[styles.annCard, { backgroundColor: c.card }]}>
                <View style={styles.annTop}>
                  <Text style={[styles.annTitle, { color: c.text }]}>{ann.title}</Text>
                  <Text style={[styles.annTime, { color: c.subText }]}>{ann.time}</Text>
                </View>
                <Text style={[styles.annBody, { color: c.subText }]}>{ann.body}</Text>
                <TouchableOpacity style={styles.deleteAnnBtn} onPress={() => handleDeleteAnn(ann.id)}>
                  <Text style={styles.deleteAnnText}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  fieldInput: { borderWidth: 1.5, borderRadius: 12, padding: 13, fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '700' },
  modalCreateBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCreateText: { color: 'white', fontSize: 15, fontWeight: '700' },
  header: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, fontWeight: '800' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16 },
  banner: { backgroundColor: '#2563eb', padding: 20 },
  bannerBadges: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: 'white', marginBottom: 4 },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  bannerStats: { flexDirection: 'row', gap: 10 },
  bannerStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, alignItems: 'center' },
  bannerStatVal: { fontSize: 18, fontWeight: '900', color: 'white' },
  bannerStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#2563eb' },
  scroll: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  quickCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2 },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  card: { borderRadius: 16, padding: 16, elevation: 2, marginBottom: 16 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  gradeBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  gradeLabel: { fontSize: 14, fontWeight: '900' },
  progressBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  gradeCount: { fontSize: 12, width: 70, textAlign: 'right' },
  attendanceCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 7, borderColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  attendancePercent: { fontSize: 16, fontWeight: '900', color: '#2563eb' },
  attendanceTitle: { fontSize: 15, fontWeight: '700' },
  attendanceSub: { fontSize: 12, marginTop: 4 },
  addBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  addBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  tableHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, marginBottom: 4 },
  tableHead: { fontSize: 10, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase' },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  studentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { color: 'white', fontSize: 14, fontWeight: '800' },
  studentName: { fontSize: 13, fontWeight: '700' },
  studentId: { fontSize: 11, marginTop: 1 },
  annCard: { borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  annTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  annTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  annTime: { fontSize: 10, fontWeight: '600' },
  annBody: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  deleteAnnBtn: { alignSelf: 'flex-end', backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteAnnText: { color: '#dc2626', fontSize: 12, fontWeight: '700' },
});
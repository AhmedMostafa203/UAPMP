
import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

// const INITIAL_CLASSES = [
//   { id: 1, code: 'CS101', name: 'Intro to Computer Science', doctor: 'Dr. Marcus Sterling', dept: 'Computer Science', students: 45, status: 'ACTIVE', color: '#2563eb' },
//   { id: 2, code: 'CS302', name: 'Data Structures & Algo', doctor: 'Dr. Sarah Jenkins', dept: 'Computer Science', students: 38, status: 'ACTIVE', color: '#059669' },
//   { id: 3, code: 'MTH500', name: 'Stochastic Processes', doctor: 'Dr. Lisa Ray', dept: 'Mathematics', students: 30, status: 'ACTIVE', color: '#7c3aed' },
//   { id: 4, code: 'ENG310', name: 'Advanced Robotics Lab', doctor: 'Dr. Sarah Jenkins', dept: 'Engineering', students: 45, status: 'PAUSED', color: '#d97706' },
//   { id: 5, code: 'ART105', name: 'UI/UX Architectural Systems', doctor: 'Prof. Elias Vance', dept: 'Visual Arts', students: 82, status: 'ACTIVE', color: '#db2777' },
//   { id: 6, code: 'BUS440', name: 'Global Market Analytics', doctor: 'Prof. Robert Chen', dept: 'Business', students: 110, status: 'CLOSED', color: '#64748b' },
// ];

//const DOCTORS = ['Dr. Marcus Sterling', 'Dr. Sarah Jenkins', 'Dr. Lisa Ray', 'Prof. Elias Vance', 'Prof. Robert Chen'];
//const DEPTS = ['Computer Science', 'Mathematics', 'Engineering', 'Visual Arts', 'Business', 'Humanities'];

export default function AdminClasses() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false); // 👈 أضفها فوق
  const [createModal, setCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [newClass, setNewClass] = useState({ code: '', name: '', doctor: '', dept: '' });
  const { colors: c, dark, toggleDark } = useTheme();
  const router = useRouter();


  const filtered = filterStatus === 'ALL' ? classes : classes.filter(cl => cl.status === filterStatus);

  const handleCreate = () => {
    if (!newClass.code || !newClass.name || !newClass.doctor) {
      Alert.alert('Error', 'Please fill in Code, Name and Doctor');
      return;
    }
    setClasses(prev => [...prev, {
      id: Date.now(),
      code: newClass.code,
      name: newClass.name,
      doctor: newClass.doctor,
      dept: newClass.dept || 'General',
      students: 0,
      status: 'ACTIVE',
      color: '#2563eb',
    }]);
    setNewClass({ code: '', name: '', doctor: '', dept: '' });
    setCreateModal(false);
    Alert.alert('Success! 🎉', 'Class created successfully');
  };

  const handleDeleteClass = async (classId, className) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف "${className}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ 1. احذف من الباكند الأول
              await api.delete(`/classes/${classId}`);

              // ✅ 2. بعد الحذف، جلب البيانات تاني من الباكند
              await fetchClasses();

              Alert.alert('نجاح', 'تم حذف الكلاس');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('خطأ', error.response?.data?.message || 'فشل الحذف');
            }
          }
        }
      ]
    );
  };
  useEffect(() => {
    fetchClasses();
  }, []);
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/my');
      console.log('Full response:', response);  // 👈 شوف إيه اللي جاي
      console.log('Response data:', response.data);
      console.log('Response code:', response.data.code);

      if (response.data.code === 'CLASSES_FETCHED') {
        console.log('First class _id:', response.data.classes[0]?._id); // 👈 تتأكد

        setClasses(response.data.classes);
      }
      else {
        console.log('Code mismatch, expected CLASSES_FETCHED but got:', response.data.code);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل تحميل الكلاسات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (id) => {
    setClasses(prev => prev.map(cl => {
      if (cl.id !== id) return cl;
      const next = cl.status === 'ACTIVE' ? 'PAUSED' : cl.status === 'PAUSED' ? 'CLOSED' : 'ACTIVE';
      return { ...cl, status: next };
    }));
  };

  const statusColor = (status) => {
    if (status === 'ACTIVE') return { bg: '#dcfce7', text: '#15803d' };
    if (status === 'PAUSED') return { bg: '#fef3c7', text: '#d97706' };
    return { bg: '#fee2e2', text: '#dc2626' };
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>

      {/* Sidebar */}
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
            { icon: '🏠', label: 'Home', route: '/(admin)/home' },
            { icon: '💬', label: 'Announcements', route: '/(admin)/announcements' },
            { icon: '👥', label: 'Users', route: '/(admin)/users' },
            { icon: '📚', label: 'Classes', active: true, route: '/(admin)/classes' },
            //{ icon: '📊', label: 'Reports' },
            //  { icon: '⚙️', label: 'Settings' },
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
          <TouchableOpacity style={[styles.sidebarItem, { marginTop: 20, borderTopWidth: 1, borderTopColor: c.border }]}>
            <Text style={styles.sidebarIcon}>🚪</Text>
            <Text style={[styles.sidebarLabel, { color: '#dc2626' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Create Class Modal */}
      <Modal visible={createModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Create New Class</Text>
            {[
              { label: 'Course Code *', key: 'code', placeholder: 'e.g. CS101' },
              { label: 'Course Name *', key: 'name', placeholder: 'e.g. Intro to Algorithms' },
              { label: 'Doctor *', key: 'doctor', placeholder: 'e.g. Dr. Marcus Sterling' },
              { label: 'Department', key: 'dept', placeholder: 'e.g. Computer Science' },
            ].map((field) => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: c.subText }]}>{field.label}</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={c.subText}
                  value={newClass[field.key]}
                  onChangeText={(val) => setNewClass(prev => ({ ...prev, [field.key]: val }))}
                />
              </View>
            ))}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: c.border }]} onPress={() => setCreateModal(false)}>
                <Text style={[styles.modalCancelText, { color: c.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateBtn} onPress={handleCreate}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} style={styles.hamburger}>
          <View style={[styles.hLine, { backgroundColor: c.text }]} />
          <View style={[styles.hLine, { backgroundColor: c.text, width: 16 }]} />
          <View style={[styles.hLine, { backgroundColor: c.text, width: 10 }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>All Classes</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.bg }]} onPress={toggleDark}>
          <Text style={styles.iconBtnText}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Banner */}
        <View style={styles.banner}>
          <View>
            <Text style={styles.bannerTitle}>Classes Management</Text>
            <Text style={styles.bannerSub}>
              {classes.length} Total • {classes.filter(c => c.status === 'ACTIVE').length} Active • {classes.reduce((a, b) => a + b.students, 0)} Students
            </Text>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModal(true)}>
            <Text style={styles.createBtnText}>+ New Class</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Active', val: classes.filter(c => c.status === 'ACTIVE').length, color: '#dcfce7', textColor: '#15803d' },
            { label: 'Paused', val: classes.filter(c => c.status === 'PAUSED').length, color: '#fef3c7', textColor: '#d97706' },
            { label: 'Closed', val: classes.filter(c => c.status === 'CLOSED').length, color: '#fee2e2', textColor: '#dc2626' },
            { label: 'Total', val: classes.length, color: '#eff6ff', textColor: '#2563eb' },
          ].map((s, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: s.color }]}>
              <Text style={[styles.statVal, { color: s.textColor }]}>{s.val}</Text>
              <Text style={[styles.statLbl, { color: s.textColor }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
          {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, { borderColor: c.border, backgroundColor: c.card }, filterStatus === f && styles.filterChipActive]}
              onPress={() => setFilterStatus(f)}
            >
              <Text style={[styles.filterText, { color: c.subText }, filterStatus === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Classes List */}
        {filtered.map((cls) => (
          <View key={cls._id} style={[styles.classCard, { backgroundColor: c.card }]}>

            {/* Card Top */}
            <View style={[styles.classCardTop, { backgroundColor: cls.color }]}>
              <View>
                <Text style={styles.classCode}>{cls.code}</Text>
                <Text style={styles.classDept}>{cls.dept}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(cls.status).bg }]}>
                <Text style={[styles.statusText, { color: statusColor(cls.status).text }]}>{cls.status}</Text>
              </View>
            </View>

            {/* Card Body */}
            <View style={styles.classCardBody}>
              <Text style={[styles.className, { color: c.text }]}>{cls.name}</Text>

              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: c.subText }]}>👨‍🏫 {cls.doctor}</Text>
                <Text style={[styles.meta, { color: c.subText }]}>👥 {cls.students} Students</Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push('/(admin)/class-details')}
                >
                  <Text style={styles.actionBtnText}>View Class</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toggleBtn, { backgroundColor: statusColor(cls.status).bg }]}
                  onPress={() => handleToggleStatus(cls._id)}
                >
                  <Text style={[styles.toggleBtnText, { color: statusColor(cls.status).text }]}>
                    {cls.status === 'ACTIVE' ? '⏸ Pause' : cls.status === 'PAUSED' ? '▶️ Resume' : '🔄 Reopen'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteClass(cls._id, cls.name)}
                >
                  <Text style={styles.deleteBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

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
  hamburger: { gap: 5, padding: 4 },
  hLine: { height: 2.5, width: 22, borderRadius: 2 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16 },
  logoSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  logoSmallText: { fontSize: 18 },
  logoName: { fontSize: 15, fontWeight: '900' },
  logoSub: { fontSize: 11 },
  scroll: { padding: 16 },
  banner: { backgroundColor: '#2563eb', borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { fontSize: 20, fontWeight: '900', color: 'white' },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  createBtn: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  createBtnText: { color: '#2563eb', fontWeight: '800', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900' },
  statLbl: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  filtersScroll: { marginBottom: 16 },
  filtersContent: { gap: 8, paddingRight: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  filterChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterText: { fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: 'white' },
  classCard: { borderRadius: 20, overflow: 'hidden', elevation: 3, marginBottom: 16 },
  classCardTop: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  classCode: { fontSize: 18, fontWeight: '900', color: 'white' },
  classDept: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  classCardBody: { padding: 16 },
  className: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  metaRow: { gap: 6, marginBottom: 14 },
  meta: { fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  actionBtnText: { color: 'white', fontSize: 13, fontWeight: '700' },
  toggleBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  toggleBtnText: { fontSize: 13, fontWeight: '700' },
  deleteBtn: { width: 44, borderRadius: 10, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 18 },
});
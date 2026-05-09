//import { useState } from 'react';
import React, { useState, useEffect } from 'react';

import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
const INITIAL_STUDENTS = [
  { id: 1, name: 'Ahmed Mohamed', studentId: '20240001', grade: 'B+', attendance: '92%' },
  { id: 2, name: 'Sara Ali', studentId: '20240002', grade: 'A', attendance: '98%' },
  { id: 3, name: 'Omar Hassan', studentId: '20240003', grade: 'C+', attendance: '75%' },
  { id: 4, name: 'Nour Ibrahim', studentId: '20240004', grade: 'A-', attendance: '88%' },
];

const INITIAL_ANNOUNCEMENTS = [
  { id: 1, title: 'Midterm Review Session Scheduled', body: 'The midterm review will take place this Friday at 4:00 PM in Hall B.', time: '2 HOURS AGO' },
  { id: 2, title: 'Updated Lab 4 Submission Guidelines', body: 'Please ensure your Git repositories are public and the README is updated.', time: 'YESTERDAY' },
];

const INITIAL_MATERIAL = [
  { id: 1, name: 'Lecture 01 Slides', type: 'PDF', size: '2.4 MB', icon: '📄' },
  { id: 2, name: 'Lab 02: Exercises', type: 'DOC', size: '1.1 MB', icon: '📝' },
  { id: 3, name: 'Recording: Logic Gates', type: 'VIDEO', size: '45:12 mins', icon: '🎥' },
];
export default function DoctorClassDetails() {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [material, setMaterial] = useState(INITIAL_MATERIAL);
  const [students, setStudents] = useState(INITIAL_STUDENTS);


  const { id } = useLocalSearchParams(); // classId من الرابط
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnnouncements();
    }
  }, [id]);

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get(`/class-announcements/class/${id}`);
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error('Fetch announcements error:', error);
    } finally {
      setLoading(false);
    }
  };






  // Modals
  const [annModal, setAnnModal] = useState(false);
  const [materialModal, setMaterialModal] = useState(false);
  const [studentModal, setStudentModal] = useState(false);

  // New items
  const [newAnn, setNewAnn] = useState({ title: '', body: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', type: 'PDF' });
  const [newStudent, setNewStudent] = useState({ name: '', studentId: '' });

  const { colors: c, dark, toggleDark } = useTheme();
  const router = useRouter();
  // comment

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // لو عاوز ردود على تعليقات


  // Handlers
  const handleAddAnn = async () => {
    if (!newAnn.title || !newAnn.body) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await api.post('/class-announcements', {
        classId: id,
        title: newAnn.title,
        body: newAnn.body
      });

      if (response.data.success) {
        Alert.alert('Success!', 'Announcement posted successfully');
        setNewAnn({ title: '', body: '' });
        setAnnModal(false);
        fetchAnnouncements();
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to post');
    }
  };
  const handleDeleteAnn = (announcementId) => {
    Alert.alert('Delete', 'Delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/class-announcements/${announcementId}`);
            fetchAnnouncements();
            Alert.alert('Success', 'Announcement deleted');
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete announcement');
          }
        }
      }
    ]);
  };
  const handleAddMaterial = () => {
    if (!newMaterial.name) {
      Alert.alert('Error', 'Please enter file name');
      return;
    }
    setMaterial(prev => [...prev, {
      id: Date.now(), name: newMaterial.name,
      type: newMaterial.type, size: 'New', icon: '📄',
    }]);
    setNewMaterial({ name: '', type: 'PDF' });
    setMaterialModal(false);
    Alert.alert('Success! 📁', 'Material uploaded successfully');
  };

  const handleDeleteMaterial = (id) => {
    Alert.alert('Delete', 'Delete this material?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setMaterial(prev => prev.filter(m => m.id !== id)) },
    ]);
  };

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

  const addComment = async (announcementId, parentCommentId = null) => {
    if (!newComment.trim()) {
      Alert.alert('تنبيه', 'الرجاء كتابة تعليق');
      return;
    }
    // في addComment
    console.log('Posting to:', '/comments');
    console.log('Data:', { announcementId, text: newComment, parentCommentId });

    try {
      await api.post('/comments', {
        announcementId,
        text: newComment,
        parentCommentId, // لو رد على تعليق معين
      });
      setNewComment('');
      setReplyingTo(null);
      fetchAnnouncements();
      Alert.alert('نجاح', 'تم إضافة تعليقك');
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل إضافة التعليق');
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>

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
                placeholder="Write your announcement here..."
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

      {/* Add Material Modal */}
      <Modal visible={materialModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>📁 Upload Material</Text>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: c.subText }]}>File Name</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: c.bg, color: c.text, borderColor: c.border }]}
                placeholder="e.g. Lecture 03 Slides"
                placeholderTextColor={c.subText}
                value={newMaterial.name}
                onChangeText={(v) => setNewMaterial(p => ({ ...p, name: v }))}
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: c.subText }]}>Type</Text>
              <View style={styles.typeRow}>
                {['PDF', 'VIDEO', 'DOC', 'LINK'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeChip, { borderColor: c.border }, newMaterial.type === type && styles.typeChipActive]}
                    onPress={() => setNewMaterial(p => ({ ...p, type }))}
                  >
                    <Text style={[styles.typeChipText, newMaterial.type === type && { color: 'white' }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: c.border }]} onPress={() => setMaterialModal(false)}>
                <Text style={[styles.modalCancelText, { color: c.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreateBtn} onPress={handleAddMaterial}>
                <Text style={styles.modalCreateText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* Course Banner */}
      <View style={styles.banner}>
        <View>
          <View style={styles.bannerBadges}>
            <View style={styles.badge}><Text style={styles.badgeText}>CS-101</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>SPRING 2024</Text></View>
          </View>
          <Text style={styles.bannerTitle}>Intro to Computer Science</Text>
          <Text style={styles.bannerSub}>Section A • Room 304 • Mon/Wed 10:00 AM</Text>
        </View>
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
            <Text style={styles.bannerStatVal}>{material.length}</Text>
            <Text style={styles.bannerStatLbl}>Files</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        {[
          { key: 'announcements', label: '📢 Posts' },
          { key: 'material', label: '📁 Material' },
          { key: 'students', label: '👥 Students' },
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

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setAnnModal(true)}>
              <Text style={styles.addBtnText}>+ Post New Announcement</Text>
            </TouchableOpacity>
            {announcements.map((ann) => (

              <View key={ann._id} style={[styles.annCard, { backgroundColor: c.card }]}>
                <View style={styles.annTop}>
                  <Text style={[styles.annTitle, { color: c.text }]}>{ann.title}</Text>
                  <Text style={[styles.annTime, { color: c.subText }]}>
                    {new Date(ann.createdAt).toLocaleDateString('ar-EG')}
                  </Text>
                </View>
                <Text style={[styles.annBody, { color: c.subText }]}>{ann.body}</Text>
                <TouchableOpacity
                  style={styles.deleteAnnBtn}
                  onPress={() => handleDeleteAnn(ann._id)}
                >
                  <Text style={styles.deleteAnnText}>🗑️ Delete</Text>
                </TouchableOpacity>


                {/* قسم التعليقات */}
                <View style={styles.commentsSection}>
                  <Text style={[styles.commentsTitle, { color: c.text }]}>
                    💬 التعليقات ({ann.comments?.length || 0})
                  </Text>

                  {ann.comments?.map((comment) => (
                    <View key={comment._id} style={[styles.commentItem, { backgroundColor: c.bg }]}>
                      <View style={styles.commentHeader}>
                        <Text style={[styles.commentUser, { color: '#2563eb' }]}>
                          {comment.userId?.fullName} ({comment.userRole === 'student' ? 'طالب' : 'دكتور'})
                        </Text>
                        {comment.userRole !== 'instructor' && (
                          <TouchableOpacity onPress={() => {
                            setReplyingTo(comment._id);
                            setNewComment(`@${comment.userId?.fullName} `);
                          }}>
                            <Text style={styles.replyBtn}>رد</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={[styles.commentText, { color: c.text }]}>{comment.text}</Text>
                      <Text style={[styles.commentTime, { color: c.subText }]}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>

                      {/* الردود على هذا التعليق */}
                      {comment.replies?.map((reply) => (
                        <View key={reply._id} style={[styles.replyItem, { backgroundColor: c.bg, marginLeft: 20 }]}>
                          <Text style={[styles.commentUser, { color: '#059669' }]}>
                            {reply.userId?.fullName} ({reply.userRole === 'student' ? 'طالب' : 'دكتور'})
                          </Text>
                          <Text style={[styles.commentText, { color: c.text }]}>{reply.text}</Text>
                          <Text style={[styles.commentTime, { color: c.subText }]}>
                            {new Date(reply.createdAt).toLocaleString()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}

                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={[styles.commentInput, { backgroundColor: c.bg, borderColor: c.border, color: c.text }]}
                      placeholder={replyingTo ? "اكتب ردك..." : "اكتب تعليقك..."}
                      placeholderTextColor={c.subText}
                      value={newComment}
                      onChangeText={setNewComment}
                    />
                    <TouchableOpacity
                      style={styles.commentButton}
                      onPress={() => addComment(ann._id, replyingTo)}
                    >
                      <Text style={styles.commentButtonText}>إرسال</Text>
                    </TouchableOpacity>
                  </View>
                  {replyingTo && (
                    <TouchableOpacity onPress={() => { setReplyingTo(null); setNewComment(''); }}>
                      <Text style={styles.cancelReply}>إلغاء الرد</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Material Tab */}
        {activeTab === 'material' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setMaterialModal(true)}>
              <Text style={styles.addBtnText}>+ Upload New Material</Text>
            </TouchableOpacity>
            {material.map((file) => (
              <View key={file.id} style={[styles.fileCard, { backgroundColor: c.card }]}>
                <Text style={styles.fileIcon}>{file.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fileName, { color: c.text }]}>{file.name}</Text>
                  <View style={styles.fileMeta}>
                    <View style={styles.fileTypeBadge}>
                      <Text style={styles.fileTypeText}>{file.type}</Text>
                    </View>
                    <Text style={[styles.fileSize, { color: c.subText }]}>{file.size}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDeleteMaterial(file.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <View>
            <TouchableOpacity style={styles.addBtn} onPress={() => setStudentModal(true)}>
              <Text style={styles.addBtnText}>+ Add Student</Text>
            </TouchableOpacity>
            <View style={[styles.studentsCard, { backgroundColor: c.card }]}>
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
                  <Text style={[styles.studentGrade, { flex: 1, color: c.text }]}>{s.grade}</Text>
                  <Text style={[styles.studentAttend, { flex: 1, color: c.subText }]}>{s.attendance}</Text>
                  <TouchableOpacity
                    style={{ flex: 0.5, alignItems: 'center' }}
                    onPress={() => handleDeleteStudent(s.id, s.name)}
                  >
                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  typeChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  typeChipText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
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
  bannerStatVal: { fontSize: 20, fontWeight: '900', color: 'white' },
  bannerStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#2563eb' },
  scroll: { padding: 16 },
  addBtn: {
    backgroundColor: '#2563eb', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginBottom: 16,
  },
  addBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  annCard: { borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  annTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  annTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  annTime: { fontSize: 10, fontWeight: '600' },
  annBody: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  deleteAnnBtn: { alignSelf: 'flex-end', backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteAnnText: { color: '#dc2626', fontSize: 12, fontWeight: '700' },
  fileCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, marginBottom: 10, elevation: 2 },
  fileIcon: { fontSize: 28 },
  fileName: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  fileMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileTypeBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  fileTypeText: { color: '#1d4ed8', fontSize: 10, fontWeight: '700' },
  fileSize: { fontSize: 12 },
  deleteIcon: { fontSize: 20 },
  studentsCard: { borderRadius: 16, padding: 16, elevation: 2 },
  tableHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, marginBottom: 4 },
  tableHead: { fontSize: 10, color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase' },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  studentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { color: 'white', fontSize: 14, fontWeight: '800' },
  studentName: { fontSize: 13, fontWeight: '700' },
  studentId: { fontSize: 11, marginTop: 1 },
  studentGrade: { fontSize: 13, fontWeight: '700' },
  studentAttend: { fontSize: 13 }, commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  replyBtn: { fontSize: 11, color: '#2563eb', fontWeight: '600' },
  replyItem: { marginTop: 8, padding: 8, borderRadius: 8 },
  cancelReply: { fontSize: 12, color: '#dc2626', textAlign: 'right', marginTop: 8 },
});
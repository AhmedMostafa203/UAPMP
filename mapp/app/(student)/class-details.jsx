import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

const CURRICULUM = [
  { week: '01', title: 'Introduction to Binary & Logic Gates', desc: 'Exploring the physical foundations of computing and binary arithmetic.', status: 'COMPLETED', files: [{ name: 'Lec01_Slides.pdf', size: '2.4 MB', icon: '📄' }, { name: 'Recording: Logic Gates', size: '45:12 mins', icon: '🎥' }] },
  { week: '02', title: 'Control Flow & Python Basics', desc: 'Starting our journey into high-level programming and conditional logic.', status: 'IN PROGRESS', files: [{ name: 'Lab 02: Conditional Exercises', size: '', icon: '📝' }, { name: 'Video: While vs For Loops', size: '', icon: '▶️' }] },
  { week: '03', title: 'Data Structures: Lists & Tuples', desc: 'Available Mar 15, 2024', status: 'LOCKED', files: [] },
];

const DUE_SOON = [
  { date: 'MAR\n12', title: 'Problem Set 01', sub: 'Computational Thinking', progress: 65, urgent: false },
  { date: 'MAR\n14', title: 'Quiz 02: Binary', sub: 'Online Proctored', progress: 0, urgent: true },
  { date: 'MAR\n18', title: 'Lab Submission 02', sub: 'Control Flow', progress: 0, urgent: false },
];

export default function StudentClassDetails() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors: c, dark, toggleDark } = useTheme();
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    if (id) {
      fetchAnnouncements();
    }
  }, [id]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/class-announcements/class/${id}`);
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (announcementId, parentCommentId = null) => {
    if (!newComment.trim()) {
      Alert.alert('تنبيه', 'الرجاء كتابة تعليق');
      return;
    }

    try {
      await api.post('/comments', {
        announcementId,
        text: newComment,
        parentCommentId,
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

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: c.text }}>Loading announcements...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { backgroundColor: c.card, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: c.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Class Details</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.bg }]} onPress={toggleDark}>
          <Text style={styles.iconBtnText}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.bannerWrap}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80' }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerBadges}>
              <View style={styles.badge}><Text style={styles.badgeText}>CS-101</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>SPRING 2024</Text></View>
            </View>
            <Text style={styles.bannerTitle}>Intro to Computer Science</Text>
            <Text style={styles.bannerSub}>Master the fundamentals of algorithmic thinking, data structures, and modern software engineering.</Text>
            <View style={styles.bannerBtns}>
              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>⬇️ Download Syllabus</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.bannerBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={styles.bannerBtnText}>💬 Class Forum</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.tabsRow, { backgroundColor: c.card, borderBottomColor: c.border }]}>
          {[
            { key: 'announcements', label: '📢 Announcements' },
            { key: 'curriculum', label: '📚 Curriculum' },
            { key: 'due', label: '📅 Due Soon' },
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

        {/* Announcements Tab - من الباكند */}
        {activeTab === 'announcements' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Announcements</Text>
            </View>
            {announcements.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: c.card }]}>
                <Text style={[styles.emptyText, { color: c.text }]}>No announcements yet</Text>
                <Text style={[styles.emptySubText, { color: c.subText }]}>Check back later for updates</Text>
              </View>
            ) : (
              announcements.map((ann) => (
                <View key={ann._id} style={[styles.annCard, { backgroundColor: c.card }]}>
                  <View style={styles.annTop}>
                    <Text style={[styles.annTitle, { color: c.text }]}>{ann.title}</Text>
                    <Text style={[styles.annTime, { color: c.subText }]}>
                      {new Date(ann.createdAt).toLocaleDateString('en-US')}
                    </Text>
                  </View>
                  <Text style={[styles.annBody, { color: c.subText }]}>{ann.body}</Text>
                  <Text style={styles.annDoctor}>— {ann.instructor?.fullName || 'Instructor'}</Text>

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
                          <TouchableOpacity onPress={() => {
                            setReplyingTo(comment._id);
                            setNewComment(`@${comment.userId?.fullName} `);
                          }}>
                            <Text style={styles.replyBtn}>رد</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.commentText, { color: c.text }]}>{comment.text}</Text>
                        <Text style={[styles.commentTime, { color: c.subText }]}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </Text>

                        {/* الردود على هذا التعليق */}
                        {comment.replies?.map((reply) => (
                          <View key={reply._id} style={[styles.replyItem, { backgroundColor: c.bg }]}>
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
              ))
            )}
          </View>
        )}

        {activeTab === 'curriculum' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Course Curriculum</Text>
            {CURRICULUM.map((week, i) => (
              <View key={i} style={[
                styles.weekCard, { backgroundColor: c.card },
                week.status === 'IN PROGRESS' && { borderWidth: 2, borderColor: '#2563eb' },
                week.status === 'LOCKED' && { opacity: 0.6 },
              ]}>
                <View style={styles.weekTop}>
                  <View style={[styles.weekNumBox, { backgroundColor: week.status === 'IN PROGRESS' ? '#2563eb' : c.bg }]}>
                    <Text style={styles.weekLabel}>WEEK</Text>
                    <Text style={[styles.weekNum, { color: week.status === 'IN PROGRESS' ? 'white' : c.text }]}>{week.week}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.weekTitleRow}>
                      {week.status !== 'LOCKED'
                        ? <View style={[styles.statusBadge, { backgroundColor: week.status === 'COMPLETED' ? '#dcfce7' : '#dbeafe' }]}>
                          <Text style={[styles.statusText, { color: week.status === 'COMPLETED' ? '#15803d' : '#1d4ed8' }]}>{week.status}</Text>
                        </View>
                        : <Text>🔒</Text>
                      }
                    </View>
                    <Text style={[styles.weekTitle, { color: c.text }]}>{week.title}</Text>
                    <Text style={[styles.weekDesc, { color: c.subText }]}>{week.desc}</Text>
                  </View>
                </View>
                {week.files.length > 0 && (
                  <View style={[styles.filesWrap, { borderTopColor: c.border }]}>
                    {week.files.map((file, j) => (
                      <TouchableOpacity key={j} style={[styles.fileRow, { backgroundColor: c.bg }]}>
                        <Text style={styles.fileIcon}>{file.icon}</Text>
                        <Text style={[styles.fileName, { color: c.text }]}>{file.name}</Text>
                        {file.size !== '' && <Text style={[styles.fileSize, { color: c.subText }]}>{file.size}</Text>}
                        <Text style={{ color: '#2563eb', fontWeight: '800' }}>→</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'due' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Due Soon</Text>
            {DUE_SOON.map((item, i) => (
              <View key={i} style={[styles.dueCard, { backgroundColor: c.card }]}>
                <View style={[styles.dueDateBox, { backgroundColor: item.urgent ? '#fee2e2' : '#eff6ff' }]}>
                  <Text style={[styles.dueDateText, { color: item.urgent ? '#dc2626' : '#2563eb' }]}>{item.date}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dueTitle, { color: c.text }]}>{item.title}</Text>
                  <Text style={[styles.dueSub, { color: c.subText }]}>{item.sub}</Text>
                  {item.urgent && <View style={styles.urgentBadge}><Text style={styles.urgentText}>URGENT</Text></View>}
                  {item.progress > 0 && (
                    <View style={styles.progressWrap}>
                      <View style={[styles.progressBg, { backgroundColor: c.border }]}>
                        <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
                      </View>
                      <Text style={[styles.progressText, { color: c.subText }]}>{item.progress}% Progress</Text>
                    </View>
                  )}
                  {item.progress === 0 && !item.urgent && <Text style={[styles.notStarted, { color: c.subText }]}>Not started</Text>}
                </View>
              </View>
            ))}
            <TouchableOpacity style={[styles.calendarBtn, { backgroundColor: c.card, borderWidth: 1, borderColor: c.border }]}>
              <Text style={[styles.calendarBtnText, { color: c.text }]}>📅 View Assignment Calendar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Course Lead</Text>
          <View style={[styles.courseLeadCard, { backgroundColor: c.card }]}>
            <View style={styles.courseLeadAvatar}>
              <Text style={styles.courseLeadAvatarText}>M</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.courseLeadName, { color: c.text }]}>Dr. Marcus Sterling</Text>
              <Text style={[styles.courseLeadRole, { color: c.subText }]}>Head of CS Department</Text>
              <Text style={[styles.courseLeadInfo, { color: c.subText }]}>✉️ m.sterling@scholar.edu</Text>
              <Text style={[styles.courseLeadInfo, { color: c.subText }]}>🕐 OH: Tue/Thu 2PM-4PM</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.scheduleBtn}>
            <Text style={styles.scheduleBtnText}>Schedule Meeting</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, fontWeight: '800' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16 },
  scroll: { paddingBottom: 20 },
  bannerWrap: { position: 'relative', height: 240 },
  bannerImage: { width: '100%', height: 240 },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', padding: 20, justifyContent: 'flex-end' },
  bannerBadges: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '700' },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: 'white', marginBottom: 8 },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginBottom: 14 },
  bannerBtns: { flexDirection: 'row', gap: 10 },
  bannerBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  bannerBtnText: { color: 'white', fontSize: 12, fontWeight: '700' },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  tabText: { fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#2563eb' },
  section: { padding: 16, marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  viewAll: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  annCard: { borderRadius: 14, padding: 14, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#2563eb', elevation: 2 },
  annTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  annTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  annTime: { fontSize: 10, fontWeight: '600' },
  annBody: { fontSize: 13, lineHeight: 19, marginBottom: 8 },
  annDoctor: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
  weekCard: { borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  weekTop: { flexDirection: 'row', gap: 14 },
  weekNumBox: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  weekLabel: { fontSize: 9, fontWeight: '700', color: '#64748b' },
  weekNum: { fontSize: 20, fontWeight: '900' },
  weekTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  weekTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  weekDesc: { fontSize: 12, lineHeight: 16 },
  filesWrap: { borderTopWidth: 1, marginTop: 14, paddingTop: 12, gap: 8 },
  fileRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 10, gap: 10 },
  fileIcon: { fontSize: 18 },
  fileName: { flex: 1, fontSize: 13, fontWeight: '600' },
  fileSize: { fontSize: 11 },
  dueCard: { flexDirection: 'row', gap: 14, padding: 14, borderRadius: 14, marginBottom: 12, elevation: 2, alignItems: 'flex-start' },
  dueDateBox: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dueDateText: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  dueTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  dueSub: { fontSize: 12, marginBottom: 6 },
  urgentBadge: { backgroundColor: '#dc2626', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  urgentText: { color: 'white', fontSize: 10, fontWeight: '700' },
  progressWrap: { marginTop: 6 },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: '#2563eb', borderRadius: 3 },
  progressText: { fontSize: 11 },
  notStarted: { fontSize: 11 },
  calendarBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  calendarBtnText: { fontSize: 14, fontWeight: '700' },
  courseLeadCard: { flexDirection: 'row', gap: 14, padding: 16, borderRadius: 16, elevation: 2, marginBottom: 12 },
  courseLeadAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center' },
  courseLeadAvatarText: { color: 'white', fontSize: 22, fontWeight: '900' },
  courseLeadName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  courseLeadRole: { fontSize: 12, marginBottom: 8 },
  courseLeadInfo: { fontSize: 12, marginBottom: 4 },
  scheduleBtn: { borderWidth: 2, borderColor: '#2563eb', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  scheduleBtnText: { color: '#2563eb', fontSize: 14, fontWeight: '700' },
  emptyContainer: { padding: 40, borderRadius: 16, alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySubText: { fontSize: 14, textAlign: 'center' },

  // Styles التعليقات
  commentsSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e5e5' },
  commentsTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  commentItem: { padding: 10, borderRadius: 8, marginBottom: 8 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  commentUser: { fontSize: 12, fontWeight: 'bold' },
  replyBtn: { fontSize: 11, color: '#2563eb', fontWeight: '600' },
  commentText: { fontSize: 13, marginBottom: 2 },
  commentTime: { fontSize: 10 },
  replyItem: { marginTop: 8, padding: 8, borderRadius: 8, marginLeft: 20 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  commentInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  commentButton: { backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  commentButtonText: { color: 'white', fontWeight: 'bold' },
  cancelReply: { fontSize: 12, color: '#dc2626', textAlign: 'right', marginTop: 8 },
});
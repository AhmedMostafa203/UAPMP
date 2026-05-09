import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.headerBackground} />
      <View style={styles.profileCard}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>AR</Text>
        </View>
        <Text style={styles.userName}>المستخدم الحالي</Text>
        <Text style={styles.userEmail}>user@example.com</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>مشاريع</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>تنبيهات</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>تعديل الملف الشخصي</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  headerBackground: { height: 150, backgroundColor: '#4A90E2' },
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 25,
    marginTop: -50,
    padding: 20,
    alignItems: 'center',
    elevation: 10
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    marginBottom: 15
  },
  avatarText: { fontSize: 30, fontWeight: 'bold', color: '#4A90E2' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#777', marginBottom: 20 },
  statsContainer: { flexDirection: 'row', marginBottom: 20 },
  statBox: { alignItems: 'center', marginHorizontal: 25 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#999' },
  editButton: { backgroundColor: '#F0F4F8', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 },
  editButtonText: { color: '#4A90E2', fontWeight: 'bold' },
  logoutButton: { margin: 30, backgroundColor: '#FFEDED', padding: 18, borderRadius: 15, alignItems: 'center' },
  logoutText: { color: '#FF4D4D', fontWeight: 'bold' }
});
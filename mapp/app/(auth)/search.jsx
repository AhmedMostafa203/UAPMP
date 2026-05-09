import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AdminManagementScreen() {
  const users = [
    {
      id: 1,
      name: "James Dalton",
      email: "j.dalton@terminal.io",
      role: "SUPER ADMIN",
      initials: "JD",
    },
    {
      id: 2,
      name: "Sarah Kincaid",
      email: "skincaid.ops@terminal.io",
      role: "INSTRUCTOR",
      initials: "SK",
    },
    {
      id: 3,
      name: "Marcus Low",
      email: "mlow@terminal.io",
      role: "SUPPORT",
      initials: "ML",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>

          <Text style={styles.headerTitle}>Admin Control</Text>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
          <MaterialIcons name="search" size={24} color="#bec6e0" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* TITLE */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Admin Management</Text>

          <Text style={styles.description}>
            Configure system users, assign roles, and manage academic classes.
          </Text>
        </View>

        {/* TABS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.activeTab}>
            <Text style={styles.activeTabText}>Users Management</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Classes Management</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#909097"
            style={styles.searchIcon}
          />

          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#909097"
            style={styles.input}
          />
        </View>

        {/* FILTER */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>All Roles</Text>

            <MaterialIcons
              name="keyboard-arrow-down"
              size={20}
              color="#909097"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterBtn}>
            <MaterialIcons name="filter-list" size={22} color="#d4e4fa" />
          </TouchableOpacity>
        </View>

        {/* USERS */}
        <View style={styles.usersSection}>
          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userTop}>
                <View style={styles.userInfo}>
                  <View style={styles.initialsBox}>
                    <Text style={styles.initials}>
                      {user.initials}
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.userName}>
                      {user.name}
                    </Text>

                    <Text style={styles.userEmail}>
                      {user.email}
                    </Text>
                  </View>
                </View>

                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>
                    {user.role}
                  </Text>
                </View>
              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <MaterialIcons
                    name="edit"
                    size={18}
                    color="#c6c6cd"
                  />

                  <Text style={styles.actionText}>EDIT</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn}>
                  <MaterialIcons
                    name="delete"
                    size={18}
                    color="#ffb4ab"
                  />

                  <Text style={styles.deleteText}>DELETE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* PAGINATION */}
        <View style={styles.pagination}>
          <Text style={styles.paginationText}>
            Showing 1-3 of 24
          </Text>

          <View style={styles.pageButtons}>
            <TouchableOpacity style={styles.pageBtn}>
              <MaterialIcons
                name="chevron-left"
                size={20}
                color="#909097"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.activePageBtn}>
              <Text style={styles.activePageText}>1</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pageBtn}>
              <Text style={styles.pageText}>2</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.pageBtn}>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color="#909097"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons
            name="dashboard"
            size={24}
            color="#909097"
          />

          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.activeNavItem}>
          <MaterialIcons
            name="group"
            size={24}
            color="#7bd0ff"
          />

          <Text style={styles.activeNavText}>
            Management
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons
            name="campaign"
            size={24}
            color="#909097"
          />

          <Text style={styles.navText}>
            Announcements
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#051424",
  },

  header: {
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: "#45464d",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#bec6e0",
    fontWeight: "bold",
  },

  headerTitle: {
    color: "#d4e4fa",
    fontSize: 22,
    fontWeight: "700",
  },

  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  titleSection: {
    padding: 20,
  },

  mainTitle: {
    color: "#d4e4fa",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },

  description: {
    color: "#909097",
    fontSize: 14,
    lineHeight: 22,
  },

  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#0d1c2d",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },

  activeTab: {
    flex: 1,
    backgroundColor: "#0c1829",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  activeTabText: {
    color: "#7bd0ff",
    fontWeight: "bold",
    fontSize: 12,
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  tabText: {
    color: "#909097",
    fontWeight: "bold",
    fontSize: 12,
  },

  searchContainer: {
    marginHorizontal: 20,
    backgroundColor: "#1c2b3c",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#45464d",
  },

  searchIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 14,
  },

  filterRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },

  dropdown: {
    flex: 1,
    backgroundColor: "#1c2b3c",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#45464d",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownText: {
    color: "#d4e4fa",
  },

  filterBtn: {
    width: 55,
    backgroundColor: "#1c2b3c",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#45464d",
  },

  usersSection: {
    paddingHorizontal: 20,
  },

  userCard: {
    backgroundColor: "#122131",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#45464d",
  },

  userTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  userInfo: {
    flexDirection: "row",
  },

  initialsBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#273647",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  initials: {
    color: "#7bd0ff",
    fontWeight: "bold",
    fontSize: 18,
  },

  userName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  userEmail: {
    color: "#909097",
    marginTop: 4,
  },

  roleBadge: {
    backgroundColor: "rgba(123,208,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  roleText: {
    color: "#7bd0ff",
    fontSize: 10,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#273647",
    paddingTop: 12,
  },

  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
  },

  actionText: {
    color: "#c6c6cd",
    marginLeft: 4,
    fontWeight: "600",
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  deleteText: {
    color: "#ffb4ab",
    marginLeft: 4,
    fontWeight: "600",
  },

  pagination: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  paginationText: {
    color: "#909097",
  },

  pageButtons: {
    flexDirection: "row",
    alignItems: "center",
  },

  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#45464d",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  activePageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#7bd0ff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  activePageText: {
    color: "#051424",
    fontWeight: "bold",
  },

  pageText: {
    color: "#d4e4fa",
  },

  bottomNav: {
    height: 80,
    borderTopWidth: 1,
    borderTopColor: "#273647",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#0d1c2d",
  },

  navItem: {
    alignItems: "center",
  },

  activeNavItem: {
    alignItems: "center",
  },

  navText: {
    color: "#909097",
    fontSize: 11,
    marginTop: 4,
  },

  activeNavText: {
    color: "#7bd0ff",
    fontSize: 11,
    marginTop: 4,
    fontWeight: "bold",
  },
});
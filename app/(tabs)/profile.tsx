import { useAuth } from "@/contexts/AuthContext";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { COLORS, TYPOGRAPHY } from "@/constants/Styles";
import { StyleSheet } from "react-native";

export default function Profile() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      const signinHref = "/signin" as Href;
      router.replace(signinHref);
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      {/* Profile Header */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarInner}>
              <MaterialIcons name="person" size={48} color="white" />
            </View>
          </View>

          <Text style={styles.username}>
            {user?.username || "Guest User"}
          </Text>
          <Text style={styles.email}>{user?.email || "user@example.com"}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.alert("Edit Profile", "Profile editing feature coming soon!")}
          >
            <MaterialIcons name="edit" size={16} color="white" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>18</Text>
          <Text style={styles.statLabel}>Movies Watched</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>7</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="email" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{user?.username || "N/A"}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { marginBottom: 0 }]}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="fingerprint" size={24} color={COLORS.accent} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.userIdText}>{user?.uid || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert("Settings", "Settings page coming soon!")}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <MaterialIcons name="settings" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.actionButtonText}>Settings</Text>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert("Help Center", "Help resources coming soon!")}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <MaterialIcons name="help-center" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.actionButtonText}>Help Center</Text>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        <MaterialIcons name="logout" size={20} color="#EF4444" />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    alignItems: "center",
  },
  avatarWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 8,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily: TYPOGRAPHY.title,
    marginBottom: 4,
  },
  email: {
    color: "#D1D5DB",
    fontSize: 14,
  },
  editButton: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(103, 214, 255, 0.16)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 24,
    marginTop: -24,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.title,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  sectionContainer: {
    marginHorizontal: 24,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.title,
    color: COLORS.text,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: "rgba(171, 139, 255, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 16,
    marginTop: 2,
  },
  userIdText: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIconContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: 16,
  },
  actionButtonText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
  },
  signOutButton: {
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 16,
    paddingVertical: 16,
  },
  signOutButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

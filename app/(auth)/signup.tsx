import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { auth, db } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile } from "@/types/user";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, COMMON_STYLES } from "@/constants/Styles";
import { StyleSheet } from "react-native";

const SignupScreen = () => {
  const { setUser } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [secureEntry, setSecureEntry] = useState(true);

  const handleSignUp = async () => {
    setError("");
    if (!username.trim() || !email.trim() || !password) {
      setError("Please enter username, email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        username: username.trim(),
        createdAt: serverTimestamp() as any,
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
      setUser(userProfile);

      router.replace("/(tabs)/home");
      Alert.alert("Success", "Account created successfully!");
    } catch (err: any) {
      let errorMessage = "Signup failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "Email is already in use";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={COMMON_STYLES.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            Create Account
          </Text>
          {/* <Text style={styles.subtitle}>
            Join our community today
          </Text> */}
        </View>

        <View style={styles.formContainer}>
          {/* Error Message */}
          {error ? (
            <View style={styles.errorWrapper}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Username Field */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#888" />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#888" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureEntry}
            />
            <TouchableOpacity onPress={() => setSecureEntry(!secureEntry)}>
              <Ionicons
                name={secureEntry ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={[
              styles.signUpButton,
              loading && styles.loadingOpacity
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialIconWrapper}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIconWrapper}>
            <Ionicons name="logo-apple" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIconWrapper}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signin")}
            style={styles.footerLink}
          >
            <Text style={styles.footerLinkText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    padding: 32,
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#E5E7EB",
    textAlign: "center",
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 24,
  },
  errorWrapper: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#F87171",
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 12,
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  loadingOpacity: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.6)",
    paddingHorizontal: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
  },
  socialIconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 32,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  footerLink: {
    marginLeft: 8,
  },
  footerLinkText: {
    color: COLORS.accent,
    fontWeight: "600",
  },
});

export default SignupScreen;

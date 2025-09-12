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
      colors={["#0f2027", "#203a43", "#2c5364"]}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center p-8"
      >
        <View className="mb-10">
          <Text className="text-4xl font-bold text-white text-center mb-2">
            Create Account
          </Text>
          <Text className="text-light-200 text-center text-base">
            Join our community today
          </Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-6">
          {/* Error Message */}
          {error ? (
            <View className="bg-red-500/20 p-3 rounded-lg mb-4">
              <Text className="text-red-400 text-center">{error}</Text>
            </View>
          ) : null}

          {/* Username Field */}
          <View className="flex-row items-center bg-white/15 rounded-xl px-4 py-3 mb-4">
            <Ionicons name="person-outline" size={20} color="#888" />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#aaa"
              className="flex-1 text-white ml-3 text-base"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          {/* Email Field */}
          <View className="flex-row items-center bg-white/15 rounded-xl px-4 py-3 mb-4">
            <Ionicons name="mail-outline" size={20} color="#888" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#aaa"
              className="flex-1 text-white ml-3 text-base"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Field */}
          <View className="flex-row items-center bg-white/15 rounded-xl px-4 py-3 mb-6">
            <Ionicons name="lock-closed-outline" size={20} color="#888" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              className="flex-1 text-white ml-3 text-base"
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
            className={`bg-amber-500 rounded-xl py-4 shadow-lg shadow-cyan-500/30 ${
              loading ? "opacity-70" : ""
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">
                Create Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-px bg-white/20" />
          <Text className="text-white/60 px-4">or continue with</Text>
          <View className="flex-1 h-px bg-white/20" />
        </View>

        {/* Social Login */}
        <View className="flex-row justify-center space-x-6">
          <TouchableOpacity className="bg-white/10 p-4 rounded-full">
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/10 p-4 rounded-full">
            <Ionicons name="logo-apple" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/10 p-4 rounded-full">
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View className="flex-row justify-center mt-10">
          <Text className="text-white/80">Already have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signin")}
            className="ml-2"
          >
            <Text className="text-cyan-400 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default SignupScreen;
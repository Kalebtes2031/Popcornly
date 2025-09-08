import { useAuth } from "@/contexts/AuthContext";
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <LinearGradient
                    colors={["#0f2027", "#203a43", "#2c5364"]}
                    
        className="pt-16 pb-10 px-6 rounded-b-3xl shadow-lg"
      >
        <View className="items-center">
          <View className="bg-white/20 p-2 rounded-full mb-4">
            <View className="bg-gray-200 border-2 border-dashed border-white rounded-full w-24 h-24 items-center justify-center">
              <MaterialIcons name="person" size={48} color="white" />
            </View>
          </View>
          
          <Text className="text-white text-2xl font-bold mb-1">
            {user?.username || "Guest User"}
          </Text>
          <Text className="text-indigo-100">{user?.email || "user@example.com"}</Text>
          
          <TouchableOpacity 
            className="mt-4 flex-row items-center bg-white/10 px-4 py-2 rounded-full"
            onPress={() => Alert.alert("Edit Profile", "Profile editing feature coming soon!")}
          >
            <MaterialIcons name="edit" size={16} color="white" />
            <Text className="text-white ml-2">Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      {/* Stats Section */}
<View className="flex-row justify-around mx-6 -mt-6 bg-white rounded-xl py-4 shadow-md">
  <View className="items-center">
    <Text className="text-2xl font-bold text-gray-800">18</Text>
    <Text className="text-gray-500">Movies Watched</Text>
  </View>
  <View className="items-center">
    <Text className="text-2xl font-bold text-gray-800">7</Text>
    <Text className="text-gray-500">Favorites</Text>
  </View>
  <View className="items-center">
    <Text className="text-2xl font-bold text-gray-800">3</Text>
    <Text className="text-gray-500">Reviews</Text>
  </View>
</View>


      {/* Account Information */}
      <View className="mx-6 mt-8 mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-4">Account Information</Text>
        
        <View className="bg-white rounded-xl p-5 shadow-sm">
          <View className="flex-row items-center mb-5">
            <View className="bg-indigo-100 p-3 rounded-lg mr-4">
              <MaterialIcons name="email" size={24} color="#2c5364" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Email</Text>
              <Text className="text-gray-800 mt-1">{user?.email || "N/A"}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-5">
            <View className="bg-indigo-100 p-3 rounded-lg mr-4">
              <MaterialIcons name="person" size={24} color="#2c5364" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">Username</Text>
              <Text className="text-gray-800 mt-1">{user?.username || "N/A"}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <View className="bg-indigo-100 p-3 rounded-lg mr-4">
              <MaterialIcons name="fingerprint" size={24} color="#2c5364" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-sm">User ID</Text>
              <Text className="text-gray-800 mt-1 break-all text-xs">{user?.uid || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="mx-6 mb-8">
        <TouchableOpacity 
          className="flex-row items-center bg-white p-5 rounded-xl mb-4 shadow-sm"
          onPress={() => Alert.alert("Settings", "Settings page coming soon!")}
        >
          <View className="bg-amber-100 p-3 rounded-lg mr-4">
            <MaterialIcons name="settings" size={24} color="#F59E0B" />
          </View>
          <Text className="text-gray-800 flex-1">Settings</Text>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center bg-white p-5 rounded-xl mb-4 shadow-sm"
          onPress={() => Alert.alert("Help Center", "Help resources coming soon!")}
        >
          <View className="bg-blue-100 p-3 rounded-lg mr-4">
            <MaterialIcons name="help-center" size={24} color="#3B82F6" />
          </View>
          <Text className="text-gray-800 flex-1">Help Center</Text>
          <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        className="mx-6 mb-20 flex-row items-center justify-center bg-white border border-red-100 rounded-xl py-4 shadow-sm"
      >
        <MaterialIcons name="logout" size={20} color="#EF4444" />
        <Text className="text-red-500 font-medium text-center text-lg ml-2">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
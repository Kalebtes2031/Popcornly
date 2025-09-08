import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('onboarding');
        setOnboardingDone(value === 'done');
      } catch {
        setOnboardingDone(false);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
  if (!authLoading && onboardingDone !== null) {
    if (onboardingDone) {
      if (!user) {
        router.replace("/(auth)/signin");
      } else {
        router.replace("/(tabs)/home");
      }
    }
  }
}, [user, authLoading, onboardingDone]);


  const handleContinue = async () => {
    await AsyncStorage.setItem('onboarding', 'done');
    router.replace("/(auth)/signin");
  };

  if (authLoading || onboardingDone === null) {
    return (
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!onboardingDone) {
    return (
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        className="flex-1"
      >
        {/* Background Elements */}
        <View className="absolute top-10 right-0 opacity-20">
          <Ionicons name="film" size={120} color="white" />
        </View>
        <View className="absolute bottom-26 left-0 opacity-20">
          <Ionicons name="videocam" size={100} color="white" />
        </View>
        <View className="absolute top-40 left-5 opacity-20">
          <Ionicons name="star" size={80} color="white" />
        </View>
        
        <View className="flex-1 justify-between py-20 px-8">
          {/* Header */}
          <View className="items-center mt-10">
            <Text className="text-5xl font-bold text-white text-center mb-2">
              Kabth Movies
            </Text>
            <Text className="text-lg text-gray-300">
              Your Personal Movie Universe
            </Text>
          </View>
          
          {/* Main Content */}
          <View className="items-center">
            <Image 
              source={require('@/assets/images/film-rel.jpg')} // Replace with your actual image path
              className="w-full  h-52 my-10 rounded-lg shadow-lg"
            />
            
            <View className="items-center">
              <Text className="text-4xl font-bold text-white text-center mb-4">
                Welcome Aboard!
              </Text>
              <Text className="text-lg text-gray-300 text-center max-w-xs">
                Discover, save, and enjoy your favorite movies all in one place
              </Text>
            </View>
            
            {/* <View className="mt-10 flex-row space-x-4">
              {[1, 2, 3].map((item) => (
                <View key={item} className="w-3 h-3 bg-white rounded-full opacity-30" />
              ))}
            </View> */}
          </View>
          
          {/* Get Started Button */}
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-amber-500 rounded-full py-5 px-8 shadow-lg shadow-amber-500/30 flex-row items-center justify-center"
          >
            <Text className="text-white font-bold text-xl mr-3">Get Started</Text>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return null;
}
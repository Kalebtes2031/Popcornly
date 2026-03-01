import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, COMMON_STYLES } from "@/constants/Styles";

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
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!onboardingDone) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
        style={COMMON_STYLES.container}
      >
        {/* Background Elements */}
        <View style={styles.bgIconTopRight}>
          <Ionicons name="film" size={120} color="white" />
        </View>
        <View style={styles.bgIconBottomLeft}>
          <Ionicons name="videocam" size={100} color="white" />
        </View>
        <View style={styles.bgIconTopLeft}>
          <Ionicons name="star" size={80} color="white" />
        </View>

        <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brandTitle}>
              Popcornly
            </Text>
            <Text style={styles.brandSubtitle}>
              Your Personal Movie Universe
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Image
              source={require('@/assets/images/film-rel.jpg')}
              style={styles.heroImage}
              contentFit="cover"
            />

            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeTitle}>
                Welcome Aboard!
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Discover, save, and enjoy your favorite movies all in one place
              </Text>
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            onPress={handleContinue}
            style={styles.getStartedButton}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bgIconTopRight: {
    position: "absolute",
    top: 40,
    right: 0,
    opacity: 0.15,
  },
  bgIconBottomLeft: {
    position: "absolute",
    bottom: 100,
    left: 0,
    opacity: 0.15,
  },
  bgIconTopLeft: {
    position: "absolute",
    top: 160,
    left: 20,
    opacity: 0.15,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  header: {
    marginTop: 40,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 18,
    color: "#D1D5DB",
  },
  mainContent: {
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    height: 200,
    marginVertical: 40,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  welcomeTextContainer: {
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: "#D1D5DB",
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 28,
  },
  getStartedButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 40,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  getStartedText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 20,
    marginRight: 12,
  },
});

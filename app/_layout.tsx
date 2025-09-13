import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "./globals.css";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";

import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet } from "react-native";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: colorScheme === "dark" ? "#000" : "#fff" },
        ]}
      >
        <AuthProvider>
          <FavoritesProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="movie/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="tv/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </FavoritesProvider>
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

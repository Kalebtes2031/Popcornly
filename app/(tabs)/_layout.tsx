import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { Image } from "expo-image";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import { COLORS, TYPOGRAPHY } from "@/constants/Styles";

const TabIcon = ({ focused, icon, title, ionicon }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.bottomtabbg}
        style={styles.activeTabContainer}
        imageStyle={styles.activeBackgroundImage}
      >
        <View style={styles.activeIconWrapper}>
          {ionicon ? (
            <Ionicons name={ionicon} size={22} color={COLORS.primary} />
          ) : (
            <Image
              source={icon}
              tintColor={COLORS.primary}
              style={styles.activeIconSize}
            />
          )}
          <Text style={styles.activeTabText}>{title}</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.inactiveTabContainer}>
      {ionicon ? (
        <Ionicons name={ionicon} size={22} color={COLORS.textMuted} />
      ) : (
        <Image
          source={icon}
          tintColor={COLORS.textMuted}
          style={styles.inactiveIconSize}
        />
      )}
    </View>
  );
};



const DEV_TABS_KEY = __DEV__
  ? `tabs-dev-${Math.random().toString(36).slice(2)}`
  : "tabs-prod";


const _Layout = () => {
  return (
    <Tabs
    //  key={DEV_TABS_KEY}
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: styles.tabBarItem,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          headerShown: false,
          title: "Movies",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ionicon="film-outline" title="Movies" />
          ),
        }}
      />
      <Tabs.Screen
        name="tvshows"
        options={{
          headerShown: false,
          title: "Tv Series",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} ionicon="tv-outline" title="Tv Series" />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          headerShown: false,
          title: "Saved",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title="Saved" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;

const styles = StyleSheet.create({
  // Tab bar – sleek, elevated with subtle blur effect
  tabBar: {
    backgroundColor: "rgba(18, 25, 35, 0.85)",
    borderRadius: 136,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 54,               // slightly taller for better proportion
    position: "absolute",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  // Each tab item fills the tab bar evenly
  tabBarItem: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  // Active pill container – exactly sized for content + comfortable padding
  activeTabContainer: {
    width: 80,               // wide enough for short labels
    height: 46,               // pill height – nicely fits inside tab bar
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,        // fully rounded
    overflow: "hidden",
    marginTop:15,
    // subtle scale gives a slight pop effect (optional, can be removed)
    transform: [{ scale: 1.02 }],
    // extra shadow for depth
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  activeBackgroundImage: {
    resizeMode: "cover",
    // optional tint to blend with background
    tintColor: "#57CC99",
  },
  activeIconWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  activeIconSize: {
    width: 22,
    height: 22,
  },
  activeTabText: {
    color: COLORS.primary,
    fontSize: 10,
    fontFamily: TYPOGRAPHY.title,
    fontWeight: "600",
    // marginTop: 4,
    letterSpacing: 0.2,
  },
  // Inactive tab – just the icon, perfectly centered
  inactiveTabContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.7,
  },
  inactiveIconSize: {
    width: 22,
    height: 22,
  },
});
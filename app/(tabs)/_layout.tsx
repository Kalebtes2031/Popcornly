import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { Image } from "expo-image";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

const TabIcon = ({ focused, icon, title, ionicon }: any) => {
  if (focused) {
    return (
      <ImageBackground
        source={images.bottomtabbg}
        style={styles.activeTabContainer}
      >
        <View style={styles.activeIconWrapper}>
          {ionicon ? (
            <Ionicons name={ionicon} size={20} color="#151312" />
          ) : (
            <Image source={icon} tintColor="#151312" style={styles.iconSize} />
          )}
          <Text style={styles.activeTabText}>
            {title}
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.inactiveTabContainer}>
      {ionicon ? (
        <Ionicons name={ionicon} size={20} color="#A8B5DB" />
      ) : (
        <Image source={icon} tintColor="#A8B5DB" style={styles.iconSize} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activeTabContainer: {
    width: 85,
    minHeight: 64,
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 32,
    overflow: "hidden",
  },
  activeIconWrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  iconSize: {
    width: 20,
    height: 20,
  },
  activeTabText: {
    color: "#151312",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 2,
  },
  inactiveTabContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderRadius: 32,
  },
});

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#030014",
          borderRadius: 56,
          // marginHorizontal: 10,
          // marginBottom: 6,
          height: 52,
          position: "absolute",
          // bottom: 13,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#030014",
        },
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
      {/* <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          title: "Search",
          tabBarItemStyle: { display: "none" },
        }}
      /> */}
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

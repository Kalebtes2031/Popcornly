import { View, Text, ImageBackground, Image } from "react-native";
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
        className="flex flex-col flex-1 w-[100px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        {ionicon ? (
          <Ionicons name={ionicon} size={20} color="#151312" />
        ) : (
          <Image source={icon} tintColor="#151312" className="size-5" />
        )}
        <Text className="text-secondary text-base font-semibold ml-2">
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      {ionicon ? (
        <Ionicons name={ionicon} size={20} color="#A8B5DB" />
      ) : (
        <Image source={icon} tintColor="#A8B5DB" className="size-5" />
      )}
    </View>
  );
};

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
          marginHorizontal: 20,
          marginBottom: 6,
          height: 52,
          position: "absolute",
          bottom: 13,
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
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          title: "Search",
          tabBarItemStyle: { display: "none" },
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

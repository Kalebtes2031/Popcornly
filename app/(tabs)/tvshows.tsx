// pages/home.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { icons } from "@/constants/icons";
import { fetchTVShows, ContentItem } from "@/services/api";
import useFetch from "@/services/useFetch";
import { getTrendingTVShows, TrendingTVDoc } from "@/services/firestoreService";

const { width } = Dimensions.get("window");
const PLACEHOLDER = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 4) / 3;

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<"latest" | "trending">("latest");

  // Fetch trending + latest TV shows
  const {
    data: trendingTV,
    loading: trendingTVLoading,
    error: trendingTVError,
    refetch: refetchTrendingTV,
  } = useFetch(getTrendingTVShows);

  const {
    data: tvShows,
    loading: tvShowsLoading,
    error: tvShowsError,
    refetch: refetchTvShows,
  } = useFetch<ContentItem[]>(() => fetchTVShows({ query: "" }));

  // Aggregate trending TV shows to avoid duplicates
  const aggregatedTrendingTV = useMemo(() => {
    if (!trendingTV) return [];
    const map = new Map<number, TrendingTVDoc>();

    trendingTV.forEach((tv) => {
      const id = tv.tv_id;
      if (map.has(id)) {
        const existing = map.get(id)!;
        map.set(id, { ...existing, count: existing.count + tv.count });
      } else {
        map.set(id, { ...tv });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [trendingTV]);

  // Refresh logic
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchTrendingTV(), refetchTvShows()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
    setRefreshing(false);
  };

  // Render item for TV shows
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <Image
        source={{
          uri:
            viewType === "latest"
              ? item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : PLACEHOLDER
              : item.poster_url || PLACEHOLDER,
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={2}>
        {item.title || "Untitled"}
      </Text>
    </TouchableOpacity>
  );

  // Choose dataset
  const displayedData =
    viewType === "latest"
      ? tvShows || []
      : aggregatedTrendingTV.map((tv) => ({
          id: tv.tv_id,
          title: tv.title ?? "Untitled",
          poster_url: tv.poster_url ?? PLACEHOLDER,
        }));

  const isLoading =
    (viewType === "latest" && tvShowsLoading) ||
    (viewType === "trending" && trendingTVLoading);

  const isError =
    (viewType === "latest" && tvShowsError) ||
    (viewType === "trending" && trendingTVError);

  return (
    <LinearGradient
      colors={["#0D0D1A", "#1A1A3A", "#2D2B55"]}
      className="flex-1"
    >
      <StatusBar style="light" />

      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-[#0D0D1A]/90 px-6 h-16 flex-row justify-between items-center">
        <View className="flex flex-row items-center gap-x-3">
          <Image source={icons.popcornly3} className="w-10 h-10" />
          <Text className="text-2xl font-bold text-white">Popcornly</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/search")}
          className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center"
        >
          <Image source={icons.search} className="w-5 h-5" tintColor="#AB8BFF" />
        </TouchableOpacity>
      </View>

      {/* TV Shows Grid */}
      {isLoading && !refreshing ? (
        <View className="flex-1 justify-center items-center h-96">
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text className="text-white mt-4">Loading ...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center h-96 px-6">
          <View className="bg-red-500/10 p-6 rounded-2xl items-center">
            <Text className="text-white text-lg font-bold mb-2">
              Error loading content
            </Text>
            <Text className="text-gray-400 text-center">
              {tvShowsError?.message || trendingTVError?.message}
            </Text>
            <TouchableOpacity
              className="bg-primary/20 rounded-xl px-6 py-3 mt-4"
              onPress={onRefresh}
            >
              <Text className="text-primary">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={displayedData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={[styles.container, { paddingTop: 70, paddingBottom: 30 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#AB8BFF"
              colors={["#AB8BFF"]}
            />
          }
          ListHeaderComponent={
            <View className="px-6 mb-4 flex-row justify-between items-center">
              <View className="flex-row bg-[#151312]/50 rounded-full p-1">
                <TouchableOpacity
                  onPress={() => setViewType("latest")}
                  className={`px-4 py-1 rounded-full ${
                    viewType === "latest" ? "bg-primary/30" : ""
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    Latest
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setViewType("trending")}
                  className={`px-4 py-1 rounded-full ${
                    viewType === "trending" ? "bg-primary/30" : ""
                  }`}
                >
                  <Text className="text-sm font-semibold text-white">
                    Trending
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    backgroundColor: "#222",
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.4,
  },
  title: {
    color: "#fff",
    fontSize: 12,
    padding: 6,
    textAlign: "center",
  },
});

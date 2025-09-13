// pages/home.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Animatable from "react-native-animatable";

import { icons } from "@/constants/icons";
import {
  fetchMovies,
  fetchTVShows,
  ContentItem,
  TrendingItem,
} from "@/services/api";
import useFetch from "@/services/useFetch";
import {
  getTrendingMovies,
  getTrendingTVShows,
  TrendingMovieDoc,
  TrendingTVDoc,
} from "@/services/firestoreService";

import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";
import TrendingCarousel from "@/components/TrendingCarousel";

import { MaterialIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const PLACEHOLDER = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

// Zoom animations
const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [trendingType, setTrendingType] = useState<"movie" | "tv">("movie");
  const [activeTrendingItem, setActiveTrendingItem] = useState<string | null>(
    null
  );

  // Refs
  const trendingFlatListRef = useRef<FlatList>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScrollAnim = useRef(new Animated.Value(0)).current;

  // Fetch trending and latest content
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(getTrendingMovies);
  const {
    data: trendingTV,
    loading: trendingTVLoading,
    error: trendingTVError,
    refetch: refreshTvTrending,
  } = useFetch(getTrendingTVShows);
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(() => fetchMovies({ query: "" }));
  const {
    data: tvShows,
    loading: tvShowsLoading,
    error: tvShowsError,
    refetch: refetchTvShows,
  } = useFetch<ContentItem[]>(() => fetchTVShows({ query: "" }));

  useEffect(() => {
    // Animate content in when data is loaded
    if ((!trendingLoading && !moviesLoading && !tvShowsLoading) || refreshing) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [trendingLoading, moviesLoading, tvShowsLoading, refreshing]);

  // Aggregate trending movies to avoid duplicates
  const aggregatedTrendingMovies = useMemo(() => {
    if (!trendingMovies) return [];
    const map = new Map<number, TrendingMovieDoc>();

    trendingMovies.forEach((movie) => {
      const id = movie.movie_id;
      if (map.has(id)) {
        const existing = map.get(id)!;
        map.set(id, { ...existing, count: existing.count + movie.count });
      } else {
        map.set(id, { ...movie });
      }
    });

    return Array.from(map.values());
  }, [trendingMovies]);

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

    return Array.from(map.values());
  }, [trendingTV]);

  // Build trending items to display
  const displayedTrending: TrendingItem[] = useMemo(() => {
    if (trendingType === "movie") {
      return aggregatedTrendingMovies
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((m) => ({
          id: m.movie_id,
          title: m.title ?? "Untitled",
          poster_url: m.poster_url ?? PLACEHOLDER,
          count: m.count,
          type: "movie" as const,
        }));
    } else if (trendingType === "tv") {
      return aggregatedTrendingTV
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((tv) => ({
          id: tv.tv_id,
          title: tv.title ?? "Untitled",
          poster_url: tv.poster_url ?? PLACEHOLDER,
          count: tv.count,
          type: "tv" as const,
        }));
    }
    return [];
  }, [trendingType, aggregatedTrendingMovies, aggregatedTrendingTV]);

  // Auto-scroll for trending items
  useEffect(() => {
    if (displayedTrending.length > 1) {
      // Clear any existing interval
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }

      // Set up new interval for auto-scrolling
      scrollIntervalRef.current = setInterval(() => {
        const currentIndex = displayedTrending.findIndex(
          (item) => `${item.type}-${item.id}` === activeTrendingItem
        );
        const nextIndex = (currentIndex + 1) % displayedTrending.length;
        const nextItem = displayedTrending[nextIndex];
        setActiveTrendingItem(`${nextItem.type}-${nextItem.id}`);

        // Scroll to the next item
        if (trendingFlatListRef.current) {
          trendingFlatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0.5, // Center the item
          });
        }
      }, 4000); // Change every 4 seconds
    }

    // Clean up on unmount
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [activeTrendingItem, displayedTrending.length]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchTrending(),
        refreshTvTrending(),
        refetchMovies(),
        refetchTvShows(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
    setRefreshing(false);
  };

  // Handle viewable items change for trending
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const item = viewableItems[0].item;
      setActiveTrendingItem(`${item.type}-${item.id}`);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <LinearGradient
      colors={["#0D0D1A", "#1A1A3A", "#2D2B55"]}
      className="flex-1"
    >
      <StatusBar style="light" />

      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-[#0D0D1A]/90 backdrop-blur-md px-6 h-16 flex-row justify-between items-center">
        <View className="flex flex-row items-center gap-x-3">
          <Image source={icons.popcornly3} className="w-10 h-10" />
          <Text className="text-2xl font-bold text-white">Popcornly</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/search")}
          className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center"
        >
          <Image
            source={icons.search}
            className="w-5 h-5"
            tintColor="#AB8BFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 70 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#AB8BFF"
            colors={["#AB8BFF"]}
          />
        }
      >
        {/* Loading/Error States */}
        {(moviesLoading ||
          trendingLoading ||
          tvShowsLoading ||
          trendingTVLoading) &&
        !refreshing ? (
          <View className="flex-1 justify-center items-center h-96">
            <ActivityIndicator size="large" color="#AB8BFF" />
            <Text className="text-white mt-4">Loading ...</Text>
          </View>
        ) : moviesError || trendingError || tvShowsError || trendingTVError ? (
          <View className="flex-1 justify-center items-center h-96 px-6">
            <View className="bg-red-500/10 p-6 rounded-2xl items-center">
              <Text className="text-white text-lg font-bold mb-2">
                Error loading content
              </Text>
              <Text className="text-gray-400 text-center">
                {moviesError?.message ||
                  trendingError?.message ||
                  tvShowsError?.message ||
                  trendingTVError?.message}
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
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="flex-1"
          >
            {/* Trending Section */}
            <View className=" mt-6">
              <View className="px-6 flex-row justify-between items-center ">
                <Text className="text-2xl font-bold text-white">
                  Trending Now
                </Text>
                <View className="flex flex-row bg-white/10 rounded-xl p-1">
                  <TouchableOpacity
                    onPress={() => {
                      setTrendingType("movie");
                      setActiveTrendingItem(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      trendingType === "movie" ? "bg-primary" : ""
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        trendingType === "movie"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      Movies
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setTrendingType("tv");
                      setActiveTrendingItem(null);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      trendingType === "tv" ? "bg-primary" : ""
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        trendingType === "tv" ? "text-white" : "text-gray-400"
                      }`}
                    >
                      TV Shows
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TrendingCarousel items={displayedTrending} />

              
            </View>

            {/* Rest of the content remains the same */}
            {/* Latest Movies */}
            <View className="px-6 mb-10">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-2xl font-bold text-white">
                  Latest Movies
                </Text>
                <TouchableOpacity>
                  <Text className="text-white text-sm">View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={movies ?? []}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4" />}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </View>

            {/* Latest TV Shows */}
            <View className="px-6 mb-10">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-2xl font-bold text-white">
                  Latest TV Series
                </Text>
                <TouchableOpacity>
                  <Text className="text-white text-sm">View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={tvShows ?? []}
                renderItem={({ item }) => <MovieCard {...item} type="tv" />}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View className="w-4" />}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </View>

            {/* Categories Section */}
            <View className="px-6 mb-10">
              <Text className="text-2xl font-bold text-white mb-5">
                Browse Categories
              </Text>
              <View className="flex-row flex-wrap justify-between">
                {[
                  "Action",
                  "Comedy",
                  "Drama",
                  "Horror",
                  "Sci-Fi",
                  "Documentary",
                ].map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    className="w-[30%] bg-white/10 rounded-2xl p-4 items-center justify-center mb-4"
                    activeOpacity={0.8}
                  >
                    <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center mb-2">
                      <Image
                        source={icons.popcornly3}
                        className="w-6 h-6"
                        tintColor="#AB8BFF"
                      />
                    </View>
                    <Text className="text-white text-sm text-center">
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

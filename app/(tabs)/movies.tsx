// pages/movies.tsx
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
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { icons } from "@/constants/icons";
import { fetchMovies, ContentItem } from "@/services/api";
import useFetch from "@/services/useFetch";
import {
  getTrendingMovies,
  TrendingMovieDoc,
} from "@/services/firestoreService";

const { width } = Dimensions.get("window");

// Card width (3 per row with spacing)
const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 4) / 3;

const PLACEHOLDER = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

export default function Movies() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<"latest" | "trending">("trending");

  // Fetch latest movies
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(() => fetchMovies({ query: "" }));

  // Fetch trending movies
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(getTrendingMovies);

  // Aggregate trending movies
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

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
  }, [trendingMovies]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMovies(), refetchTrending()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <Link
      href={{
        pathname: "/movie/[id]",
        params: { id: String(item.id) },
      }}
      asChild
    >
      <TouchableOpacity style={styles.card}>
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
        {/* <Text style={styles.title} numberOfLines={1}>
        {item.title || "Untitled"}
      </Text> */}
      </TouchableOpacity>
    </Link>
  );

  // Choose dataset
  const displayedData =
    viewType === "latest"
      ? movies || []
      : aggregatedTrendingMovies.map((m) => ({
          id: m.movie_id,
          title: m.title ?? "Untitled",
          poster_url: m.poster_url ?? PLACEHOLDER,
        }));

  const isLoading =
    (viewType === "latest" && moviesLoading) ||
    (viewType === "trending" && trendingLoading);

  const isError =
    (viewType === "latest" && moviesError) ||
    (viewType === "trending" && trendingError);

  return (
    <LinearGradient
      colors={["#0D0D1A","#0f2027", "#203a43"]}
      className="flex-1"
    >
      <StatusBar style="light" />

      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-[#0D0D1A]/90 px-6 pt-8 h-[90px] flex-col justify-center items-center">
        <View className="flex-row w-full justify-between items-center">
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
              tintColor="#fff"
            />
          </TouchableOpacity>
        </View>
        <View className=" mb-6 pt-4 flex flex-row justify-start items-start w-full">
          <View className="flex flex-row bg-white/10 p-1 rounded-xl">
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setViewType("trending")}
                className={`px-4 p-[2px] rounded-full ${
                  viewType === "trending" ? "bg-primary" : ""
                }`}
              >
                <Text className="text-sm font-semibold text-white">
                  Trending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewType("latest")}
                className={`px-4 p-[2px] rounded-xl ${
                  viewType === "latest" ? "bg-primary" : ""
                }`}
              >
                <Text className="text-sm font-semibold text-white">Latest</Text>
              </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </View>

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
              {moviesError?.message || trendingError?.message}
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
          renderItem={({ item, index }) => (
            <View
              style={{
                flex: 1 / 3,
                marginBottom: 12,
                marginRight: index % 3 !== 2 ? 8 : 0,
              }}
            >
              {renderItem({ item })}
            </View>
          )}
          numColumns={3}
          contentContainerStyle={[{ paddingTop: 100, paddingBottom: 50 }]}
          columnWrapperStyle={{
            flex: 1,
            justifyContent: "flex-start",
            marginHorizontal: CARD_MARGIN,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#AB8BFF"
              colors={["#AB8BFF"]}
            />
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
    // margin: CARD_MARGIN,
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

//home.tsx
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMovies } from "@/services/api";
import MovieCard from "../../components/MovieCard";
import { getTrendingMovies } from "@/services/firestoreService";
import TrendingCard from "@/components/TrendingCard";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const router = useRouter();

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useFetch(() => fetchMovies({ query: "" }));

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchTrending(), refetchMovies()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
    setRefreshing(false);
  };

  const aggregatedTrendingMovies = React.useMemo(() => {
    if (!trendingMovies) return [];

    const map = new Map();

    trendingMovies.forEach((movie) => {
      const id = movie.movie_id;
      if (map.has(id)) {
        const existing = map.get(id);
        map.set(id, {
          ...existing,
          count: (existing.count ?? 0) + (movie.count ?? 0),
        });
      } else {
        map.set(id, { ...movie });
      }
    });

    return Array.from(map.values());
  }, [trendingMovies]);

  return (
    <LinearGradient
      colors={["#34233B", "#23363B", "#0f2027"]}
      // colors={["#0f2027", "#203a43", "#2c5364", "#437057"]}
      className="flex-1"
    >
      {/* <Image source={images.bg} className="absolute w-full z-0" /> */}
      <ScrollView
        className="flex-1 "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* <Image source={icons.logo} className="w-12 h-10 mt-6 mb-5 mx-auto" /> */}

        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <Text>Error: {moviesError?.message || trendingError?.message}</Text>
        ) : (
          <View className="flex-1">
            <View className="w-full px-5 flex-row justify-between items-center mt-4 ">
              <View className="flex flex-row justify-center items-center gap-x-3">
                <Image
                  source={icons.popcornly3}
                  className="w-8 h-8 object-contain"
                />
                <Text className="text-2xl font- font-bold text-white">
                  Popcornly
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  router.push("/search");
                }}
              >
                <Image
                  source={icons.search}
                  className="w-5 h-5"
                  resizeMode="contain"
                  tintColor="#AB8BFF"
                />
              </TouchableOpacity>
            </View>

            {trendingMovies && (
              <View className="mt-5">
                <Text className="px-5 text-lg text-white font-bold mb-3">
                  Trending Movies
                </Text>
                <FlatList
                  data={aggregatedTrendingMovies}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                  className=" mt-3"
                />
              </View>
            )}

            <>
              <Text className="px-5 text-lg text-white font-bold mt-5 mb-3">
                Latest Movies
              </Text>

              <FlatList
  data={movies}
  renderItem={({ item }) => <MovieCard {...item} />}
  keyExtractor={(item) => item.id.toString()}
  numColumns={3}
  contentContainerStyle={{
    paddingHorizontal: 2, // space on left and right
    alignItems: "center",  // center items horizontally
  }}
  columnWrapperStyle={{
    justifyContent: "space-between", // spread items evenly in the row
    // marginBottom: 12, // vertical gap between rows
  }}
  scrollEnabled={false}
/>

            </>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

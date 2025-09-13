// app/search.tsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  fetchMovies,
  fetchTVShows,
  fetchMovieGenres,
  fetchTVGenres,
  ContentItem,
} from "@/services/api";
import {
  updateSearchCount,
  getTrendingMovies,
  getTrendingTVShows,
  TrendingMovieDoc,
  TrendingTVDoc,
} from "@/services/firestoreService";
import { icons } from "@/constants/icons";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const PLACEHOLDER = icons.person;

// Skeleton Loading Component
const SkeletonLoader = () => {
  return (
    <View className="mr-5 w-40">
      <View className="w-40 h-56 bg-gray-700 rounded-2xl animate-pulse" />
      <View className="mt-2 w-24 h-4 bg-gray-700 rounded animate-pulse" />
    </View>
  );
};

// Skeleton for search results
const SearchResultSkeleton = () => {
  return (
    <View className="flex-row mb-5 bg-white/5 rounded-2xl p-3 animate-pulse">
      <View className="w-24 h-36 bg-gray-700 rounded-xl mr-4" />
      <View className="flex-1 justify-between py-2">
        <View>
          <View className="h-6 bg-gray-700 rounded mb-3 w-3/4" />
          <View className="flex-row items-center mb-3">
            <View className="h-6 bg-gray-700 rounded-full mr-2 w-16" />
            <View className="h-4 bg-gray-700 rounded w-10" />
          </View>
          <View className="flex-row items-center mb-3">
            <View className="h-4 bg-gray-700 rounded w-16" />
          </View>
          <View className="h-4 bg-gray-700 rounded w-1/2" />
        </View>
        <View className="flex-row justify-end">
          <View className="h-8 bg-gray-700 rounded-full w-28" />
        </View>
      </View>
    </View>
  );
};

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [movieGenresMap, setMovieGenresMap] = useState<Record<string, string>>(
    {}
  );
  const [tvGenresMap, setTvGenresMap] = useState<Record<string, string>>({});
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovieDoc[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingTVDoc[]>([]);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  /** Load genres and trending items */
  useEffect(() => {
    const loadData = async () => {
      setLoadingTrending(true);
      try {
        const [moviesGenres, tvGenres, movies, tv] = await Promise.all([
          fetchMovieGenres(),
          fetchTVGenres(),
          getTrendingMovies(),
          getTrendingTVShows(),
        ]);
        setMovieGenresMap(moviesGenres);
        setTvGenresMap(tvGenres);
        setTrendingMovies(movies);
        setTrendingTV(tv);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingTrending(false);
        
        // Animate content in
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
    };
    loadData();
  }, []);

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

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
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

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [trendingTV]);


  const getPosterSource = (posterPath?: string | null, fallback?: any) => {
    if (
      posterPath &&
      typeof posterPath === "string" &&
      posterPath.trim() !== ""
    ) {
      return { uri: `https://image.tmdb.org/t/p/w500${posterPath}` };
    }
    // local placeholder (must NOT be passed as {uri: ...})
    return fallback ?? icons.person;
  };

  /** Handle search input */
  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [movies, tvShows] = await Promise.all([
        fetchMovies({ query: text }),
        fetchTVShows({ query: text }),
      ]);

      // Ensure types are correct
      const typedMovies = movies.map((m) => ({ ...m, type: "movie" as const }));
      const typedTVShows = tvShows.map((tv) => ({
        ...tv,
        type: "tv" as const,
      }));

      const combined = [...typedMovies, ...typedTVShows];
      combined.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));

      setResults(combined);
    } catch (err) {
      console.error("Search error:", err);
    }
    setLoading(false);
  };

  /** Pull to refresh */
  const onRefresh = async () => {
    setRefreshing(true);
    setLoadingTrending(true);
    try {
      if (query) {
        await handleSearch(query);
      } else {
        const [movies, tv] = await Promise.all([
          getTrendingMovies(),
          getTrendingTVShows(),
        ]);
        setTrendingMovies(movies);
        setTrendingTV(tv);
      }
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
      setLoadingTrending(false);
    }
  };

  /** Render search result */
  const renderResultItem = ({
    item,
    index,
  }: {
    item: ContentItem;
    index: number;
  }) => {
    const year = item.release_date?.split("-")[0] ?? "N/A";
    const genreNames =
      item.type === "movie"
        ? item.genres
            ?.map((id) => movieGenresMap[id])
            .filter(Boolean)
            .join(", ") ?? "N/A"
        : item.genres
            ?.map((id) => tvGenresMap[id])
            .filter(Boolean)
            .join(", ") ?? "N/A";

    const posterUri = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${String(item.poster_path)}`
      : PLACEHOLDER;

    return (
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }}
      >
        <TouchableOpacity
          key={`${item.type}-${item.id}-${index}`}
          className="flex-row mb-5 bg-white/5 rounded-2xl p-3"
          onPress={() => {
            updateSearchCount(query, item);
            router.push({
              pathname: item.type === "tv" ? "/tv/[id]" : "/movie/[id]",
              params: { id: item.id },
            });
          }}
          activeOpacity={0.7}
        >
          <Image
            source={getPosterSource(item.poster_path, icons.person)}
            className="w-24 h-36 rounded-xl mr-4"
            resizeMode="cover"
          />
          <View className="flex-1 justify-between py-2">
            <View>
              <Text className="text-white text-lg font-bold mb-1" numberOfLines={2}>
                {item.title}
              </Text>
              <View className="flex-row items-center mb-1">
                <View className={`px-2 py-1 rounded-full mr-2 ${item.type === "movie" ? "bg-blue-500/20" : "bg-purple-500/20"}`}>
                  <Text className={`text-xs ${item.type === "movie" ? "text-blue-400" : "text-purple-400"}`}>
                    {item.type?.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-gray-400 text-xs">{year}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text className="text-yellow-400 text-sm ml-1">
                  {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
                </Text>
              </View>
              <Text className="text-gray-300 text-xs" numberOfLines={2}>
                {genreNames}
              </Text>
            </View>
            <View className="flex-row justify-end">
              <View className="bg-primary/20 px-3 py-1 rounded-full flex-row items-center">
                <Text className="text-white text-xs mr-1">View Details</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#AB8BFF" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  /** Render trending items */
  const renderTrendingItem = (
    item: TrendingMovieDoc | TrendingTVDoc,
    type: "movie" | "tv",
    index: number
  ) => {
    const id =
      type === "movie"
        ? (item as TrendingMovieDoc).movie_id
        : (item as TrendingTVDoc).tv_id;
    const posterUrl = item.poster_url ? String(item.poster_url) : PLACEHOLDER;

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <TouchableOpacity
          key={`trending-${type}-${id}-${index}`}
          className="mr-5 w-40"
          onPress={() =>
            router.push({
              pathname: type === "tv" ? "/tv/[id]" : "/movie/[id]",
              params: { id },
            })
          }
          activeOpacity={0.8}
        >
          <View className="relative">
            <Image
              source={getPosterSource(item.poster_url, icons.person)}
              className="w-40 h-56 rounded-2xl"
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              className="absolute bottom-0 left-0 right-0 h-32 rounded-b-2xl"
            />
            <View className="absolute bottom-3 left-3 right-3">
              <View className={`absolute -top-7 right-0 bg-primary rounded-full w-10 h-10 items-center justify-center ${type === "movie" ? "bg-blue-500" : "bg-purple-500"}`}>
                <FontAwesome 
                  name={type === "movie" ? "film" : "tv"} 
                  size={16} 
                  color="white" 
                />
              </View>
              <Text className="text-white text-sm font-bold" numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={["#0D0D1A", "#1A1A3A", "#2D2B55"]}
      className="flex-1"
    >
      {/* Header with Search Input */}
      <View className="px-6 pt-8 pb-4 bg-black/30">
        <Text className="text-white text-3xl font-bold mb-6">Discover</Text>
        <View className="flex-row items-center bg-white/10 rounded-2xl px-4 py-3 shadow-lg">
          <Ionicons name="search" size={22} color="#AB8BFF" />
          <TextInput
            placeholder="Search movies or TV shows..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-white text-base ml-3"
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center mt-12">
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text className="text-white mt-4 text-base">Searching...</Text>
        </View>
      ) : query ? (
        results.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons name="search-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg text-center mt-4">
              No results found for "{query}"
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              Try different keywords or browse trending content
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
            renderItem={renderResultItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#AB8BFF"
                colors={["#AB8BFF"]}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingTop: 10 }}
          />
        )
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#AB8BFF"
              colors={["#AB8BFF"]}
            />
          }
          contentContainerStyle={{ paddingBottom: 65 }}
        >
          {/* Trending Movies */}
          <View className="px-6 ">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-white text-xl font-bold">Trending Movies</Text>
              <TouchableOpacity>
                <Text className="text-white text-sm">See All</Text>
              </TouchableOpacity>
            </View>
            
            {loadingTrending ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[1, 2, 3, 4, 5, 6]}
                keyExtractor={(item) => `skeleton-movie-${item}`}
                renderItem={() => <SkeletonLoader />}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            ) : (
              <FlatList
                data={aggregatedTrendingMovies}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  `trending-movie-${item.movie_id}-${index}`
                }
                renderItem={({ item, index }) =>
                  renderTrendingItem(item, "movie", index)
                }
                contentContainerStyle={{ paddingRight: 20 }}
              />
            )}
          </View>

          {/* Trending TV Shows */}
          <View className="px-6 mt-4">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-white text-xl font-bold">Trending TV Shows</Text>
              <TouchableOpacity>
                <Text className="text-white text-sm">See All</Text>
              </TouchableOpacity>
            </View>
            
            {loadingTrending ? (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[1, 2, 3, 4, 5, 6]}
                keyExtractor={(item) => `skeleton-tv-${item}`}
                renderItem={() => <SkeletonLoader />}
                contentContainerStyle={{ paddingRight: 20 }}
              />
            ) : (
              <FlatList
                data={aggregatedTrendingTV}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => `trending-tv-${item.tv_id}-${index}`}
                renderItem={({ item, index }) =>
                  renderTrendingItem(item, "tv", index)
                }
                contentContainerStyle={{ paddingRight: 20 }}
              />
            )}
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
}
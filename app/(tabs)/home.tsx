// pages/home.tsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { icons } from "@/constants/icons";
import { queryKeys } from "@/constants/queryKeys";
import {
  fetchMovies,
  fetchTVShows,
  ContentItem,
  TrendingItem,
} from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import {
  getTrendingMovies,
  getTrendingTVShows,
  TrendingMovieDoc,
  TrendingTVDoc,
} from "@/services/firestoreService";

import MovieCard from "@/components/movies/MovieCard";
import TrendingCard from "@/components/trending/TrendingCard";
import TrendingCarousel from "@/components/trending/TrendingCarousel";

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

import { COLORS, COMMON_STYLES } from "@/constants/Styles";

// Skeleton Components
const SkeletonLoader = () => {
  return (
    <View style={skeletonStyles.loaderContainer}>
      <View style={skeletonStyles.loaderBox} />
    </View>
  );
};

const SkeletonHeaderLoader = () => {
  return (
    <View style={skeletonStyles.headerContainer}>
      <View style={skeletonStyles.headerTitle} />
      <View style={skeletonStyles.headerButton} />
    </View>
  );
};

const SkeletonTrendingCarousel = () => {
  return (
    <View style={skeletonStyles.trendingMargin}>
      <FlashList
        horizontal
        estimatedItemSize={width * 0.72}
        showsHorizontalScrollIndicator={false}
        data={[1, 2, 3, 4, 5, 6]}
        keyExtractor={(item) => `skeleton-trending-${item}`}
        renderItem={({ index }) => (
          <View
            style={[
              skeletonStyles.trendingItem,
              { marginLeft: index === 0 ? 16 : 8, marginRight: index === 5 ? 16 : 8 }
            ]}
          >
            <View style={skeletonStyles.trendingBox} />
          </View>
        )}
        contentContainerStyle={{ paddingRight: 20 }}
      />
    </View>
  );
};

const SkeletonCategoryGrid = () => {
  return (
    <View style={skeletonStyles.categoryGrid}>
      <View style={skeletonStyles.categoryTitle} />
      <View style={skeletonStyles.categoryRow}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={skeletonStyles.categoryItem}>
            <View style={skeletonStyles.categoryIcon} />
            <View style={skeletonStyles.categoryLabel} />
          </View>
        ))}
      </View>
    </View>
  );
};

const HomePageSkeleton = () => {
  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={COMMON_STYLES.container}
    >
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Trending Section Skeleton */}
        <View style={skeletonStyles.trendingSection}>
          <SkeletonHeaderLoader />
          <SkeletonTrendingCarousel />
        </View>

        {/* Latest Movies Skeleton */}
        <View style={skeletonStyles.sectionMargin}>
          <View style={skeletonStyles.headerRow}>
            <View style={skeletonStyles.sectionTitle} />
            <View style={skeletonStyles.sectionLink} />
          </View>
          <FlashList
            horizontal
            estimatedItemSize={160}
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3, 4, 5, 6]}
            keyExtractor={(item) => `skeleton-movie-${item}`}
            renderItem={() => <SkeletonLoader />}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Latest TV Shows Skeleton */}
        <View style={skeletonStyles.sectionMargin}>
          <View style={skeletonStyles.headerRow}>
            <View style={skeletonStyles.sectionTitle} />
            <View style={skeletonStyles.sectionLink} />
          </View>
          <FlashList
            horizontal
            estimatedItemSize={160}
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3, 4, 5, 6]}
            keyExtractor={(item) => `skeleton-tv-${item}`}
            renderItem={() => <SkeletonLoader />}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        </View>

        {/* Categories Skeleton */}
        <SkeletonCategoryGrid />
      </ScrollView>
    </LinearGradient>
  );
};

const skeletonStyles = StyleSheet.create({
  loaderContainer: {
    marginRight: 20,
    width: 160,
  },
  loaderBox: {
    width: 160,
    height: 224,
    backgroundColor: '#374151',
    borderRadius: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    width: 128,
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  headerButton: {
    width: 80,
    height: 32,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  trendingMargin: {
    marginTop: 16,
  },
  trendingItem: {
    width: width * 0.72,
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trendingBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#374151',
    borderRadius: 16,
  },
  categoryGrid: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  categoryTitle: {
    width: 192,
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '30%',
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#4B5563',
    borderRadius: 24,
    marginBottom: 8,
  },
  categoryLabel: {
    width: 64,
    height: 16,
    backgroundColor: '#4B5563',
    borderRadius: 4,
  },
  trendingSection: {
    marginTop: 24,
  },
  sectionMargin: {
    marginBottom: 40,
    marginTop: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    width: 160,
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  sectionLink: {
    width: 48,
    height: 24,
    backgroundColor: '#374151',
    borderRadius: 4,
  }
});


export default function Home() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [trendingType, setTrendingType] = useState<"movie" | "tv">("movie");
  const [activeTrendingItem, setActiveTrendingItem] = useState<string | null>(
    null
  );

  // Refs
  const trendingFlatListRef = useRef<FlashList<any>>(null);
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScrollAnim = useRef(new Animated.Value(0)).current;

  // Fetch trending and latest content
  const {
    data: trendingMovies,
    isLoading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useQuery({ queryKey: queryKeys.trendingMovies(), queryFn: getTrendingMovies });
  const {
    data: trendingTV,
    isLoading: trendingTVLoading,
    error: trendingTVError,
    refetch: refreshTvTrending,
  } = useQuery({ queryKey: queryKeys.trendingTV(), queryFn: getTrendingTVShows });
  const {
    data: movies,
    isLoading: moviesLoading,
    error: moviesError,
    refetch: refetchMovies,
  } = useQuery({ queryKey: queryKeys.latestMoviesList(), queryFn: () => fetchMovies({ query: "" }) });
  const {
    data: tvShows,
    isLoading: tvShowsLoading,
    error: tvShowsError,
    refetch: refetchTvShows,
  } = useQuery({ queryKey: queryKeys.latestTVList(), queryFn: () => fetchTVShows({ query: "" }) });

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
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={COMMON_STYLES.container}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={icons.popcornly3} style={styles.logo} />
          <Text style={styles.headerTitle}>Popcornly</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/search")}
          style={styles.searchButton}
        >
          <Image
            source={icons.search}
            style={styles.searchIcon}
            tintColor={COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        {/* Loading/Error States */}
        {(moviesLoading ||
          trendingLoading ||
          tvShowsLoading ||
          trendingTVLoading) &&
          !refreshing ? (
          <HomePageSkeleton />
        ) : moviesError || trendingError || tvShowsError || trendingTVError ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>
                Error loading content
              </Text>
              <Text style={styles.errorText}>
                {moviesError?.message ||
                  trendingError?.message ||
                  tvShowsError?.message ||
                  trendingTVError?.message}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRefresh}
              >
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              flex: 1,
            }}
          >
            {/* Trending Section */}
            <View style={styles.trendingSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Trending Now
                </Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setTrendingType("movie");
                      setActiveTrendingItem(null);
                    }}
                    style={[
                      styles.toggleButton,
                      trendingType === "movie" && styles.toggleButtonActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        trendingType === "movie" && styles.toggleTextActive
                      ]}
                    >
                      Movies
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setTrendingType("tv");
                      setActiveTrendingItem(null);
                    }}
                    style={[
                      styles.toggleButton,
                      trendingType === "tv" && styles.toggleButtonActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        trendingType === "tv" && styles.toggleTextActive
                      ]}
                    >
                      TV Shows
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TrendingCarousel items={displayedTrending} />
            </View>

            {/* Latest Movies */}
            <View style={styles.listSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Latest Movies
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/movies")}
                  style={styles.seeAllButton}
                >
                  <Text style={styles.seeAllText}>All</Text>
                  <MaterialIcons name="navigate-next" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.listWrapper}>
                <FlashList
                  estimatedItemSize={160}
                  data={movies ?? []}
                  renderItem={({ item }) => <MovieCard {...item} />}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                  contentContainerStyle={styles.listPadding}
                />
              </View>
            </View>

            {/* Latest TV Shows */}
            <View style={styles.listSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Latest TV Series
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/tvshows")}
                  style={styles.seeAllButton}
                >
                  <Text style={styles.seeAllText}>All</Text>
                  <MaterialIcons name="navigate-next" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.listWrapper}>
                <FlashList
                  estimatedItemSize={160}
                  data={tvShows ?? []}
                  renderItem={({ item }) => <MovieCard {...item} type="tv" />}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                  contentContainerStyle={styles.listPadding}
                />
              </View>
            </View>

            {/* Categories Section */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>
                Browse Categories
              </Text>
              <View style={styles.categoryGrid}>
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
                    style={styles.categoryItem}
                    activeOpacity={0.8}
                  >
                    <View style={styles.categoryIconCircle}>
                      <Image
                        source={icons.popcornly3}
                        style={styles.categoryIcon}
                        tintColor={COLORS.accent}
                      />
                    </View>
                    <Text style={styles.categoryText}>
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

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(13, 13, 26, 0.9)',
    paddingHorizontal: 24,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(171, 139, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingTop: 70,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 384,
    paddingHorizontal: 24,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(171, 139, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  retryText: {
    color: COLORS.accent,
  },
  trendingSection: {
    marginTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.accent,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  toggleTextActive: {
    color: COLORS.text,
  },
  listSection: {
    marginBottom: 40,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  seeAllText: {
    color: COLORS.text,
    fontSize: 14,
  },
  listWrapper: {
    minHeight: 180, // Resolves FlashList warning
  },
  listPadding: {
    paddingBottom: 8,
    paddingLeft: 10,
  },
  categoriesSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  categoryItem: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryIconCircle: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(171, 139, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
  },
});

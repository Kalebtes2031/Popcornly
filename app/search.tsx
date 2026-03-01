import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { COLORS, TYPOGRAPHY } from "@/constants/Styles";
import { icons } from "@/constants/icons";
import {
  ContentItem,
  fetchMovieGenres,
  fetchMovies,
  fetchTVGenres,
  fetchTVShows,
} from "@/services/api";
import {
  getTrendingMovies,
  getTrendingTVShows,
  TrendingMovieDoc,
  TrendingTVDoc,
  updateSearchCount,
} from "@/services/firestoreService";

const PLACEHOLDER_POSTER = "https://placehold.co/300x450/0F172A/E2E8F0.png";

type DiscoverCard = {
  id: number;
  title: string;
  poster_url: string;
  type: "movie" | "tv";
};

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [discoveryLoading, setDiscoveryLoading] = useState(true);

  const [movieGenresMap, setMovieGenresMap] = useState<Record<string, string>>({});
  const [tvGenresMap, setTvGenresMap] = useState<Record<string, string>>({});
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovieDoc[]>([]);
  const [trendingTV, setTrendingTV] = useState<TrendingTVDoc[]>([]);

  const searchRequestRef = useRef(0);
  const trimmedQuery = query.trim();

  const loadDiscoveryData = async () => {
    setDiscoveryLoading(true);
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
      console.error("Error loading discovery data:", error);
    } finally {
      setDiscoveryLoading(false);
    }
  };

  useEffect(() => {
    loadDiscoveryData();
  }, []);

  const performSearch = async (term: string) => {
    const requestId = ++searchRequestRef.current;

    if (!term) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const [movies, tvShows] = await Promise.all([
        fetchMovies({ query: term }),
        fetchTVShows({ query: term }),
      ]);

      if (requestId !== searchRequestRef.current) {
        return;
      }

      const typedMovies = movies.map((item) => ({ ...item, type: "movie" as const }));
      const typedTVShows = tvShows.map((item) => ({ ...item, type: "tv" as const }));
      const combined = [...typedMovies, ...typedTVShows].sort(
        (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0)
      );
      setResults(combined);
    } catch (error) {
      if (requestId === searchRequestRef.current) {
        setResults([]);
      }
      console.error("Search error:", error);
    } finally {
      if (requestId === searchRequestRef.current) {
        setSearchLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(trimmedQuery);
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [trimmedQuery]);

  const aggregatedTrendingMovies = useMemo<DiscoverCard[]>(() => {
    const map = new Map<number, TrendingMovieDoc>();
    trendingMovies.forEach((movie) => {
      const existing = map.get(movie.movie_id);
      if (existing) {
        map.set(movie.movie_id, { ...existing, count: existing.count + movie.count });
      } else {
        map.set(movie.movie_id, { ...movie });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        id: item.movie_id,
        title: item.title ?? "Untitled",
        poster_url: item.poster_url || PLACEHOLDER_POSTER,
        type: "movie" as const,
      }));
  }, [trendingMovies]);

  const aggregatedTrendingTV = useMemo<DiscoverCard[]>(() => {
    const map = new Map<number, TrendingTVDoc>();
    trendingTV.forEach((tv) => {
      const existing = map.get(tv.tv_id);
      if (existing) {
        map.set(tv.tv_id, { ...existing, count: existing.count + tv.count });
      } else {
        map.set(tv.tv_id, { ...tv });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        id: item.tv_id,
        title: item.title ?? "Untitled",
        poster_url: item.poster_url || PLACEHOLDER_POSTER,
        type: "tv" as const,
      }));
  }, [trendingTV]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadDiscoveryData(),
        trimmedQuery ? performSearch(trimmedQuery) : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const openDetails = (type: "movie" | "tv", id: number | string) => {
    router.push({
      pathname: type === "tv" ? "/tv/[id]" : "/movie/[id]",
      params: { id: String(id) },
    });
  };

  const renderSearchItem = ({ item }: { item: ContentItem }) => {
    const year = item.release_date?.split("-")[0] ?? "N/A";
    const genreText =
      item.type === "movie"
        ? item.genres?.map((id) => movieGenresMap[id]).filter(Boolean).slice(0, 2).join("  |  ") || "N/A"
        : item.genres?.map((id) => tvGenresMap[id]).filter(Boolean).slice(0, 2).join("  |  ") || "N/A";

    const posterUri = item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : PLACEHOLDER_POSTER;

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => {
          if (trimmedQuery && item.type) {
            updateSearchCount(trimmedQuery, item);
          }
          openDetails((item.type ?? "movie") as "movie" | "tv", item.id);
        }}
        activeOpacity={0.82}
      >
        <Image source={{ uri: posterUri }} style={styles.resultPoster} contentFit="cover" />

        <View style={styles.resultBody}>
          <Text style={styles.resultTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.typePill, item.type === "tv" ? styles.typePillTV : styles.typePillMovie]}>
              <Text style={styles.typePillText}>{(item.type ?? "movie").toUpperCase()}</Text>
            </View>
            <Text style={styles.metaText}>{year}</Text>
            <Text style={styles.metaText}>Rating {(item.vote_average ?? 0).toFixed(1)}</Text>
          </View>

          <Text style={styles.genreText} numberOfLines={1}>
            {genreText}
          </Text>

          <View style={styles.detailsPill}>
            <Text style={styles.detailsPillText}>View details</Text>
            <MaterialIcons name="arrow-forward" size={14} color={COLORS.accentSecondary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscoverCard = ({ item }: { item: DiscoverCard }) => (
    <TouchableOpacity
      style={styles.discoverCard}
      onPress={() => openDetails(item.type, item.id)}
      activeOpacity={0.84}
    >
      <Image
        source={{ uri: item.poster_url || PLACEHOLDER_POSTER }}
        style={styles.discoverPoster}
        contentFit="cover"
      />
      <View style={styles.discoverOverlay}>
        <Text style={styles.discoverType}>{item.type === "movie" ? "MOVIE" : "TV"}</Text>
      </View>
      <Text style={styles.discoverTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.searchFieldWrap}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search movies or TV shows"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {trimmedQuery ? (
        searchLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Searching titles...</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptyBody}>{`No matches found for "${trimmedQuery}"`}</Text>
          </View>
        ) : (
          <FlashList
            data={results}
            estimatedItemSize={166}
            keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
            renderItem={renderSearchItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.accent}
                colors={[COLORS.accent]}
              />
            }
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
          contentContainerStyle={styles.discoveryContent}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Movies</Text>
            <TouchableOpacity onPress={() => router.push("/movies")}> 
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>

          {discoveryLoading ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : (
            <FlashList
              data={aggregatedTrendingMovies}
              horizontal
              estimatedItemSize={128}
              keyExtractor={(item, index) => `discover-movie-${item.id}-${index}`}
              renderItem={renderDiscoverCard}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending TV Shows</Text>
            <TouchableOpacity onPress={() => router.push("/tvshows")}> 
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>

          {discoveryLoading ? (
            <View style={styles.loadingInline}>
              <ActivityIndicator color={COLORS.accent} />
            </View>
          ) : (
            <FlashList
              data={aggregatedTrendingTV}
              horizontal
              estimatedItemSize={128}
              keyExtractor={(item, index) => `discover-tv-${item.id}-${index}`}
              renderItem={renderDiscoverCard}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "rgba(8, 13, 23, 0.94)",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchFieldWrap: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 8,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textGray,
    fontFamily: TYPOGRAPHY.title,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
  },
  emptyBody: {
    marginTop: 8,
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 14,
  },
  resultsContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },
  resultCard: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  resultPoster: {
    width: 84,
    height: 122,
    borderRadius: 12,
  },
  resultBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  resultTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: TYPOGRAPHY.title,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 8,
  },
  typePill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typePillMovie: {
    backgroundColor: "rgba(103, 214, 255, 0.18)",
  },
  typePillTV: {
    backgroundColor: "rgba(245, 196, 81, 0.18)",
  },
  typePillText: {
    color: COLORS.text,
    fontSize: 10,
    fontFamily: TYPOGRAPHY.title,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  genreText: {
    color: COLORS.textGray,
    fontSize: 12,
    marginTop: 6,
  },
  detailsPill: {
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  detailsPillText: {
    color: COLORS.text,
    fontSize: 12,
  },
  discoveryContent: {
    paddingTop: 16,
    paddingBottom: 96,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: TYPOGRAPHY.title,
  },
  sectionAction: {
    color: COLORS.accentSecondary,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 12,
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  loadingInline: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  discoverCard: {
    width: 126,
    marginRight: 12,
  },
  discoverPoster: {
    width: 126,
    height: 176,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  discoverOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(8, 13, 23, 0.78)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  discoverType: {
    color: COLORS.text,
    fontSize: 10,
    fontFamily: TYPOGRAPHY.title,
  },
  discoverTitle: {
    color: COLORS.textGray,
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
  },
});

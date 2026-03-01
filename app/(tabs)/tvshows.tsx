// pages/home.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { COLORS, COMMON_STYLES, TYPOGRAPHY } from "@/constants/Styles";

import { icons } from "@/constants/icons";
import { queryKeys } from "@/constants/queryKeys";
import { fetchTVShows, ContentItem } from "@/services/api";
import { getTrendingTVShows, TrendingTVDoc } from "@/services/firestoreService";

const { width } = Dimensions.get("window");
const PLACEHOLDER = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

const CARD_MARGIN = 8;
const CARD_WIDTH = (width - CARD_MARGIN * 4) / 3;

export default function TVShows() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<"latest" | "trending">("trending");

  // Fetch trending + latest TV shows
  const {
    data: trendingTV,
    isLoading: trendingTVLoading,
    error: trendingTVError,
    refetch: refetchTrendingTV,
  } = useQuery({ queryKey: queryKeys.trendingTV(), queryFn: getTrendingTVShows });

  const {
    data: tvShowsData,
    isLoading: tvShowsLoading,
    error: tvShowsError,
    refetch: refetchTvShows,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.latestTVInfinite(),
    queryFn: ({ pageParam = 1 }) => fetchTVShows({ query: "", page: pageParam }),
    getNextPageParam: (lastPage: ContentItem[], allPages: ContentItem[][]) =>
      Array.isArray(lastPage) && lastPage.length > 0 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const tvShows: ContentItem[] = tvShowsData
    ? tvShowsData.pages.flatMap((page: ContentItem[]) => (Array.isArray(page) ? page : []))
    : [];

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
    <Link
      href={{
        pathname: "/tv/[id]",
        params: { id: String(item.id) },
      }}
      asChild
    >
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
          contentFit="cover"
        />
      </TouchableOpacity>
    </Link>
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
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={COMMON_STYLES.container}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Image source={icons.popcornly3} style={styles.logoIcon} />
            <Text style={styles.logoText}>Popcornly</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/search")}
            style={styles.searchButton}
          >
            <Image
              source={icons.search}
              style={styles.searchIcon}
              tintColor="#fff"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.filterSection}>
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <TouchableOpacity
                onPress={() => setViewType("trending")}
                style={[
                  styles.filterTab,
                  viewType === "trending" && styles.filterTabActive
                ]}
              >
                <Text style={styles.filterTabText}>
                  Trending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewType("latest")}
                style={[
                  styles.filterTab,
                  viewType === "latest" && styles.filterTabActive
                ]}
              >
                <Text style={styles.filterTabText}>Latest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* TV Shows Grid */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading ...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Error loading content
            </Text>
            <Text style={styles.errorBody}>
              {tvShowsError?.message || trendingTVError?.message}
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
        <FlashList
          estimatedItemSize={220}
          data={displayedData}
          keyExtractor={(item, index) => `${(item as any).id}-${index}`}
          renderItem={({ item, index }: { item: any, index: number }) => (
            <View
              style={{
                flex: 1,
                marginBottom: 12,
                marginRight: index % 3 !== 2 ? 8 : 0,
              }}
            >
              {renderItem({ item })}
            </View>
          )}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (viewType === "latest" && hasNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 20 }} /> : null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    // paddingTop: 6,
    height: 115,
    backgroundColor: 'rgba(8, 13, 23, 0.94)',
    zIndex: 10,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 22,
    fontFamily: TYPOGRAPHY.title,
    color: COLORS.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(103, 214, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  filterSection: {
    width: '100%',
  },
  filterContainer: {
    backgroundColor: COLORS.card,
    padding: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.accent,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.title,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textGray,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 111, 97, 0.12)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 97, 0.25)',
  },
  errorTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: TYPOGRAPHY.title,
    marginBottom: 8,
  },
  errorBody: {
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(103, 214, 255, 0.16)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  retryText: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: "100%",
    height: CARD_WIDTH * 1.4,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 86,
    paddingHorizontal: CARD_MARGIN,
  },
});

import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, COMMON_STYLES, TYPOGRAPHY } from "@/constants/Styles";
import { icons } from "@/constants/icons";
import { queryKeys } from "@/constants/queryKeys";
import { fetchTVDetails } from "@/services/api";
import { useFavorites } from "@/contexts/FavoritesContext";

interface InfoRowProps {
  label: string;
  value?: string | number | null;
}

const formatSeasonsEpisodes = (seasons?: number, episodes?: number) => {
  if (!seasons || !episodes) return "N/A";
  return `${seasons} seasons | ${episodes} episodes`;
};

const InfoRow = ({ label, value }: InfoRowProps) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? "N/A"}</Text>
  </View>
);

export default function TVDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const tvId = Array.isArray(id) ? id[0] : id;

  const {
    data: tv,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.tvDetails(tvId ?? ""),
    queryFn: () => fetchTVDetails(String(tvId)),
    enabled: Boolean(tvId),
  });

  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(String(tvId), "tv");

  const toggleFavorite = async () => {
    if (!tvId || !tv) return;

    if (favorite) {
      const favoriteDoc = favorites.find(
        (item) => String(item.itemId) === String(tvId) && item.type === "tv"
      );
      if (favoriteDoc) {
        await removeFavorite(favoriteDoc.id);
      }
      return;
    }

    await addFavorite({
      itemId: String(tvId),
      type: "tv",
      title: tv.name,
      poster: tv.poster_path,
    });
  };

  const openHomepage = async () => {
    if (!tv?.homepage) {
      Alert.alert("Trailer unavailable", "No homepage or trailer link was provided.");
      return;
    }

    const canOpen = await Linking.canOpenURL(tv.homepage);
    if (!canOpen) {
      Alert.alert("Unable to open", "The provided link cannot be opened on this device.");
      return;
    }

    Linking.openURL(tv.homepage);
  };

  if (!tvId) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>Invalid show id</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.stateBody}>Loading TV details...</Text>
      </View>
    );
  }

  if (error || !tv) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>Failed to load details</Text>
        <Text style={styles.stateBody}>{error instanceof Error ? error.message : "Try again later."}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const posterUri = tv.poster_path
    ? `https://image.tmdb.org/t/p/w780${tv.poster_path}`
    : "https://placehold.co/780x1170/0F172A/E2E8F0.png";

  const genres = Array.isArray(tv.genres)
    ? tv.genres.map((genre: { name: string }) => genre.name).join("  |  ")
    : "N/A";

  return (
    <View style={COMMON_STYLES.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: posterUri }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={["transparent", "rgba(7, 11, 20, 0.94)"]}
            style={styles.heroOverlay}
          />

          <TouchableOpacity style={styles.heroBack} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={openHomepage}>
            <Image source={icons.play} style={styles.playIcon} contentFit="contain" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {tv.name}
            </Text>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={22}
                color={favorite ? "#FF6F61" : COLORS.text}
              />
            </TouchableOpacity>
          </View>

          {tv.tagline ? <Text style={styles.tagline}>{tv.tagline}</Text> : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{tv.first_air_date?.split("-")[0] || "N/A"}</Text>
            <Text style={styles.metaText}>{formatSeasonsEpisodes(tv.number_of_seasons, tv.number_of_episodes)}</Text>
            <Text style={styles.metaText}>Rating {(tv.vote_average ?? 0).toFixed(1)}</Text>
          </View>

          <InfoRow label="Overview" value={tv.overview || "N/A"} />
          <InfoRow label="Genres" value={genres} />

          <Text style={styles.sectionLabel}>Production Companies</Text>
          <View style={styles.companyList}>
            {Array.isArray(tv.production_companies) && tv.production_companies.length > 0 ? (
              tv.production_companies.slice(0, 8).map((company: { id: number; name: string }) => (
                <View key={company.id} style={styles.companyTag}>
                  <Text style={styles.companyTagText}>{company.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.stateBody}>N/A</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  stateTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: TYPOGRAPHY.title,
    textAlign: "center",
  },
  stateBody: {
    marginTop: 10,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.title,
  },
  scrollContent: {
    paddingBottom: 46,
  },
  heroWrap: {
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: 460,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBack: {
    position: "absolute",
    top: 14,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(7, 11, 20, 0.72)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    position: "absolute",
    right: 20,
    bottom: 36,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 22,
    height: 24,
    marginLeft: 2,
  },
  card: {
    marginTop: -28,
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 26,
    marginRight: 10,
  },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagline: {
    marginTop: 8,
    color: COLORS.textGray,
    fontStyle: "italic",
  },
  metaRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  infoBlock: {
    marginTop: 16,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: COLORS.text,
    lineHeight: 22,
  },
  sectionLabel: {
    marginTop: 18,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 14,
  },
  companyList: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  companyTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  companyTagText: {
    color: COLORS.textGray,
    fontSize: 12,
  },
});

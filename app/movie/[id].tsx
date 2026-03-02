import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
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
import { WebView } from "react-native-webview";

import { COLORS, COMMON_STYLES, TYPOGRAPHY } from "@/constants/Styles";
import { queryKeys } from "@/constants/queryKeys";
import {
  fetchMovieDetails,
  fetchMovieTrailerKey,
  fetchMovieWatchProviders,
  TMDBWatchProvider,
} from "@/services/api";
import { useFavorites } from "@/contexts/FavoritesContext";

interface InfoRowProps {
  label: string;
  value?: string | number | null;
}

const formatRuntime = (runtime?: number) => {
  if (!runtime || runtime <= 0) return "N/A";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}m`;
};

const formatCurrency = (value?: number) => {
  if (!value || value <= 0) return "N/A";
  return `$${(value / 1_000_000).toFixed(1)}M`;
};

const InfoRow = ({ label, value }: InfoRowProps) => (
  <View style={styles.infoBlock}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? "N/A"}</Text>
  </View>
);

const ProviderSection = ({
  title,
  providers,
}: {
  title: string;
  providers: TMDBWatchProvider[];
}) => {
  if (!providers.length) return null;

  return (
    <View style={styles.providerSection}>
      <Text style={styles.providerSectionTitle}>{title}</Text>
      <View style={styles.providerRow}>
        {providers.map((provider) => (
          <View key={`${title}-${provider.provider_id}`} style={styles.providerCard}>
            <Image
              source={{
                uri: provider.logo_path
                  ? `https://image.tmdb.org/t/p/w92${provider.logo_path}`
                  : "https://placehold.co/92x92/0F172A/E2E8F0.png",
              }}
              style={styles.providerLogo}
              contentFit="cover"
            />
            <Text style={styles.providerName} numberOfLines={2}>
              {provider.provider_name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function MovieDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const movieId = Array.isArray(id) ? id[0] : id;

  const [trailerVisible, setTrailerVisible] = useState(false);
  const [trailerLoadFailed, setTrailerLoadFailed] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");

  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.movieDetails(movieId ?? ""),
    queryFn: () => fetchMovieDetails(String(movieId)),
    enabled: Boolean(movieId),
  });

  const { data: trailerKey, isLoading: trailerLoading } = useQuery({
    queryKey: queryKeys.movieTrailer(movieId ?? ""),
    queryFn: () => fetchMovieTrailerKey(String(movieId)),
    enabled: Boolean(movieId),
  });

  const { data: watchProviders = {}, isLoading: providersLoading } = useQuery({
    queryKey: queryKeys.movieWatchProviders(movieId ?? ""),
    queryFn: () => fetchMovieWatchProviders(String(movieId)),
    enabled: Boolean(movieId),
  });

  const availableCountries = useMemo(() => Object.keys(watchProviders).sort(), [watchProviders]);

  useEffect(() => {
    if (!availableCountries.length) return;
    if (!availableCountries.includes(selectedCountry)) {
      setSelectedCountry(availableCountries[0]);
    }
  }, [availableCountries, selectedCountry]);

  const selectedProviders = watchProviders[selectedCountry];

  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(String(movieId), "movie");

  const toggleFavorite = async () => {
    if (!movieId || !movie) return;

    if (favorite) {
      const favoriteDoc = favorites.find(
        (item) => String(item.itemId) === String(movieId) && item.type === "movie"
      );
      if (favoriteDoc) await removeFavorite(favoriteDoc.id);
      return;
    }

    await addFavorite({
      itemId: String(movieId),
      type: "movie",
      title: movie.title,
      poster: movie.poster_path,
    });
  };

  const openTrailer = () => {
    if (!trailerKey) {
      Alert.alert("Trailer unavailable", "No trailer was found for this title.");
      return;
    }
    setTrailerLoadFailed(false);
    setTrailerVisible(true);
  };

  const openTrailerOnYoutube = async () => {
    if (!trailerKey) return;
    const url = `https://www.youtube.com/watch?v=${trailerKey}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert("Cannot open trailer", "YouTube link is not available on this device.");
      return;
    }
    await Linking.openURL(url);
  };

  if (!movieId) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateTitle}>Invalid movie id</Text>
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
        <Text style={styles.stateBody}>Loading movie details...</Text>
      </View>
    );
  }

  if (error || !movie) {
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

  const posterUri = movie.poster_path
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
    : "https://placehold.co/780x1170/0F172A/E2E8F0.png";

  const genres = Array.isArray(movie.genres)
    ? movie.genres.map((genre: { name: string }) => genre.name).join("  |  ")
    : "N/A";

  return (
    <View style={COMMON_STYLES.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: posterUri }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient colors={["transparent", "rgba(7, 11, 20, 0.94)"]} style={styles.heroOverlay} />

          <TouchableOpacity style={styles.heroBack} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={openTrailer}>
            {trailerLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="play" size={22} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {movie.title}
            </Text>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={22}
                color={favorite ? "#FF6F61" : COLORS.text}
              />
            </TouchableOpacity>
          </View>

          {movie.tagline ? <Text style={styles.tagline}>{movie.tagline}</Text> : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{movie.release_date?.split("-")[0] || "N/A"}</Text>
            <Text style={styles.metaText}>{formatRuntime(movie.runtime)}</Text>
            <Text style={styles.metaText}>Rating {(movie.vote_average ?? 0).toFixed(1)}</Text>
          </View>

          <InfoRow label="Overview" value={movie.overview || "N/A"} />
          <InfoRow label="Genres" value={genres} />

          <View style={styles.doubleInfoRow}>
            <InfoRow label="Budget" value={formatCurrency(movie.budget)} />
            <InfoRow label="Revenue" value={formatCurrency(movie.revenue)} />
          </View>

          <Text style={styles.sectionLabel}>Where To Watch</Text>
          {providersLoading ? (
            <ActivityIndicator style={{ marginTop: 10 }} color={COLORS.accent} />
          ) : availableCountries.length === 0 ? (
            <Text style={styles.stateBody}>No provider data available.</Text>
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryRow}>
                {availableCountries.map((countryCode) => (
                  <TouchableOpacity
                    key={countryCode}
                    onPress={() => setSelectedCountry(countryCode)}
                    style={[
                      styles.countryChip,
                      selectedCountry === countryCode && styles.countryChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countryChipText,
                        selectedCountry === countryCode && styles.countryChipTextActive,
                      ]}
                    >
                      {countryCode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {selectedProviders?.link ? (
                <TouchableOpacity
                  onPress={async () => {
                    const link = selectedProviders?.link;
                    if (!link) return;
                    const canOpen = await Linking.canOpenURL(link);
                    if (!canOpen) {
                      Alert.alert("Cannot open link", "Provider link is not available on this device.");
                      return;
                    }
                    await Linking.openURL(link);
                  }}
                  style={styles.providerLinkBtn}
                >
                  <Text style={styles.providerLinkBtnText}>Open provider page</Text>
                  <Ionicons name="open-outline" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              ) : null}

              <ProviderSection title="Stream" providers={selectedProviders?.flatrate ?? []} />
              <ProviderSection title="Rent" providers={selectedProviders?.rent ?? []} />
              <ProviderSection title="Buy" providers={selectedProviders?.buy ?? []} />
            </>
          )}

          <Text style={styles.sectionLabel}>Production Companies</Text>
          <View style={styles.companyList}>
            {Array.isArray(movie.production_companies) && movie.production_companies.length > 0 ? (
              movie.production_companies.slice(0, 8).map((company: { id: number; name: string }) => (
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

      <Modal visible={trailerVisible} animationType="slide" onRequestClose={() => setTrailerVisible(false)}>
        <View style={styles.trailerModalContainer}>
          <View style={styles.trailerHeader}>
            <Text style={styles.trailerTitle}>Trailer</Text>
            <TouchableOpacity onPress={() => setTrailerVisible(false)}>
              <Ionicons name="close" size={26} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          {trailerKey ? (
            trailerLoadFailed ? (
              <View style={styles.centeredState}>
                <Text style={styles.stateBody}>
                  Embedded playback is blocked for this trailer.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={openTrailerOnYoutube}>
                  <Text style={styles.primaryButtonText}>Open On YouTube</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <WebView
                source={{
                  uri: `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&playsinline=1&rel=0&modestbranding=1`,
                }}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback
                onError={() => setTrailerLoadFailed(true)}
                onHttpError={() => setTrailerLoadFailed(true)}
                style={styles.trailerWebview}
              />
            )
          ) : (
            <View style={styles.centeredState}>
              <Text style={styles.stateBody}>Trailer unavailable.</Text>
            </View>
          )}
        </View>
      </Modal>
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
  doubleInfoRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "space-between",
  },
  sectionLabel: {
    marginTop: 18,
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 14,
  },
  countryRow: {
    marginTop: 10,
    gap: 8,
    paddingRight: 10,
  },
  countryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  countryChipText: {
    color: COLORS.textGray,
    fontSize: 12,
    fontFamily: TYPOGRAPHY.title,
  },
  countryChipTextActive: {
    color: COLORS.primary,
  },
  providerLinkBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  providerLinkBtnText: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 12,
  },
  providerSection: {
    marginTop: 14,
  },
  providerSectionTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    marginBottom: 8,
  },
  providerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  providerCard: {
    width: 80,
    alignItems: "center",
  },
  providerLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  providerName: {
    color: COLORS.textGray,
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
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
  trailerModalContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  trailerHeader: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trailerTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 16,
  },
  trailerWebview: {
    flex: 1,
    backgroundColor: "black",
  },
});


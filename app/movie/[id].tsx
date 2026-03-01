import { COLORS, COMMON_STYLES } from "@/constants/Styles";
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { icons } from "@/constants/icons";
import { queryKeys } from "@/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { fetchMovieDetails } from "@/services/api";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Ionicons } from "@expo/vector-icons";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

// Format runtime from minutes to "Xh Ym"
const formatRuntime = (runtime: number | undefined) => {
  if (!runtime) return "N/A";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}m`;
};

// Format budget/revenue in million dollars with one decimal place
const formatCurrency = (num: number) => {
  return `$${(num / 1_000_000).toFixed(1)} million`;
};

// Helper to check positive number
const isPositiveNumber = (value?: number | null): value is number =>
  typeof value === "number" && value > 0;

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={3}>
      {value !== null && value !== undefined ? value : "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    data: movie,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: queryKeys.movieDetails(id as string),
    queryFn: () => fetchMovieDetails(id as string),
  });

  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(id as string, "movie");

  const toggleFavorite = () => {
    if (favorite) {
      const favoriteDoc = favorites.find((fav) => String(fav.itemId) === String(id) && fav.type === "movie");
      if (favoriteDoc) {
        removeFavorite(favoriteDoc.id);
      }
    } else {
      if (movie) {
        addFavorite({
          itemId: id as string,
          type: "movie",
          title: movie.title,
          poster: movie.poster_path,
        });
      }
    }
  };

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );

  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Oops! Something went wrong: {error.message}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={COMMON_STYLES.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Poster + Play Button */}
        <View style={styles.posterContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            style={styles.heroPoster}
            contentFit="cover"
          />

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              if (movie?.homepage) {
                Linking.openURL(movie.homepage);
              } else {
                alert("Trailer not available");
              }
            }}
          >
            <Image
              source={icons.play}
              style={styles.playIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Movie Basic Info */}
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.movieTitle}>
              {movie?.title}
            </Text>
            {/* Favorite Button */}
            <TouchableOpacity
              onPress={toggleFavorite}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={favorite ? "heart" : "heart-outline"}
                size={22}
                color={favorite ? "#EF4444" : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>

          {movie?.tagline ? (
            <Text style={styles.tagline}>
              {movie.tagline}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {movie?.release_date?.split("-")[0] || "N/A"}
            </Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>
              {formatRuntime(movie?.runtime ?? undefined)}
            </Text>
          </View>

          <View style={styles.ratingBadge}>
            <Image source={icons.star} style={styles.starIcon} />
            <Text style={styles.ratingText}>
              {movie?.vote_average?.toFixed(1) ?? 0}
            </Text>
            <Text style={styles.voteCount}>
              ({movie?.vote_count} votes)
            </Text>
          </View>

          {/* Overview */}
          <MovieInfo label="Overview" value={movie?.overview} />

          {/* Genres */}
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g: any) => g.name).join(" • ") || "N/A"}
          />

          {/* Budget and Revenue */}
          <View style={styles.financialRow}>
            {isPositiveNumber(movie?.budget) && (
              <MovieInfo label="Budget" value={formatCurrency(movie.budget)} />
            )}
            {isPositiveNumber(movie?.revenue) && (
              <MovieInfo
                label="Revenue"
                value={formatCurrency(movie.revenue)}
              />
            )}
          </View>

          {/* Production Companies */}
          <Text style={styles.productionLabel}>
            Production Companies
          </Text>
          <View style={styles.companiesList}>
            {movie?.production_companies?.map((c: any) => (
              <View
                key={c.id}
                style={styles.companyItem}
              >
                {c.logo_path ? (
                  <View style={styles.logoWrapper}>
                    <Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w92${c.logo_path}`,
                      }}
                      style={styles.companyLogo}
                      contentFit="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.placeholderLogo}>
                    <Text style={styles.placeholderName}>{c.name}</Text>
                  </View>
                )}
                {c.logo_path && (
                  <Text style={styles.companyName}>
                    {c.name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          style={styles.backButtonIcon}
          tintColor="#fff"
          contentFit="contain"
        />
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  posterContainer: {
    position: "relative",
  },
  heroPoster: {
    width: "100%",
    height: 450,
  },
  playButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#FFFFFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playIcon: {
    width: 24,
    height: 28,
    marginLeft: 4,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    marginTop: -32,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 16,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  tagline: {
    color: "#D1D5DB",
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "500",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  metaText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  metaDot: {
    color: "#9CA3AF",
    marginHorizontal: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  ratingText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  voteCount: {
    color: "#9CA3AF",
    fontSize: 13,
    marginLeft: 6,
  },
  infoRow: {
    marginTop: 20,
  },
  infoLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  infoValue: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productionLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 24,
    marginBottom: 12,
  },
  companiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  companyItem: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 150,
  },
  logoWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 4,
    marginRight: 8,
  },
  companyLogo: {
    width: 36,
    height: 36,
  },
  placeholderLogo: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  placeholderName: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  companyName: {
    color: "#FFFFFF",
    fontSize: 12,
    flexShrink: 1,
  },
  floatingBackButton: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  backButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    transform: [{ rotate: "180deg" }],
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Details;

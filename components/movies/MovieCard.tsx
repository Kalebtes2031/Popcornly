// components/MovieCard.tsx
import { Link } from "expo-router";
import { Text, TouchableOpacity, View, Animated, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ContentItem } from "@/services/api";
import { useEffect, useRef } from "react";

const PLACEHOLDER = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

type MovieCardProps = ContentItem;

import { COLORS } from "@/constants/Styles";

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
  type = "movie",
}: MovieCardProps) => {
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(id, type);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleFavorite = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (favorite) {
      const favoriteDoc = favorites.find(
        (fav) => fav.itemId === id && fav.type === type
      );
      if (favoriteDoc) removeFavorite(favoriteDoc.id);
    } else {
      addFavorite({
        itemId: id,
        type,
        title,
        poster: poster_path,
      });
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <Link
        href={{
          pathname: type === "tv" ? "/tv/[id]" : "/movie/[id]",
          params: { id: String(id) },
        }}
        asChild
      >
        <TouchableOpacity activeOpacity={0.8}>
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri: poster_path
                  ? `https://image.tmdb.org/t/p/w500${poster_path}`
                  : PLACEHOLDER,
              }}
              style={styles.posterImage}
              contentFit="cover"
            />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.overlayGradient}
            />

            {vote_average !== undefined && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {vote_average.toFixed(1)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={toggleFavorite}
              style={styles.favoriteButton}
              activeOpacity={0.8}
            >
              {favorite ? (
                <Fontisto name="favorite" size={14} color="#FFC107" />
              ) : (
                <Ionicons name="heart-outline" size={14} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Link>

      <View style={styles.infoContainer}>
        <Text
          style={styles.movieTitle}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={styles.releaseYear}>
          {release_date?.split("-")[0] || "N/A"}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 144,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 7,
    overflow: 'hidden',
    aspectRatio: 2 / 3,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    // Native Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '33%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  movieTitle: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  releaseYear: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

export default MovieCard;

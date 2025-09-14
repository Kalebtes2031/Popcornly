// components/MovieCard.tsx
import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFavorites } from "@/contexts/FavoritesContext";
import { ContentItem } from "@/services/api";
import { useEffect, useRef } from "react";

const PLACEHOLDER = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

type MovieCardProps = ContentItem;

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
      const favoriteDoc = favorites.find((fav) => fav.itemId === id && fav.type === type);
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
      style={{ 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }] 
      }}
      className="w-36 "
    >
      <Link
        href={{
          pathname: type === "tv" ? "/tv/[id]" : "/movie/[id]",
          params: { id: String(id) },
        }}
        asChild
      >
        <TouchableOpacity activeOpacity={0.8}>
          <View className="relative rounded-[7px] overflow-hidden aspect-[2/3] mb-3 shadow-lg shadow-black/50">
            <Image
              source={{ uri: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : PLACEHOLDER }}
              className="w-full h-full"
              resizeMode="cover"
            />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              className="absolute bottom-0 left-0 right-0 h-1/3"
            />

            {vote_average !== undefined && (
              <View className="absolute top-[5px] left-[5px] flex-row items-center bg-black/80 px-2 py-1 rounded-full">
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text className="text-xs text-white font-bold ml-1">{vote_average.toFixed(1)}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={toggleFavorite}
              className="absolute top-[5px] right-[5px] w-7 h-7 items-center justify-center rounded-full bg-gray-900/90"
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

      <View className="px-1">
        <Text className="text-white font-semibold mb-1 text-sm" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-gray-400 text-xs">{release_date?.split("-")[0] || "N/A"}</Text>
      </View>
    </Animated.View>
  );
};

export default MovieCard;
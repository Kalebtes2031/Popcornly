//components/MovieCard.tsx
import { Link } from "expo-router";
import { Text, Image, TouchableOpacity, View } from "react-native";
import { icons } from "@/constants/icons";
import { useFavorites } from "@/contexts/FavoritesContext";
import AntDesign from "@expo/vector-icons/AntDesign";

type Movie = {
  id: number;
  poster_path?: string;
  title: string;
  vote_average?: number;
  release_date?: string;
};

const MovieCard = ({
  id,
  poster_path,
  title,
  vote_average,
  release_date,
}: Movie) => {
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(id);

  const toggleFavorite = () => {
    if (favorite) {
      const favoriteDoc = favorites.find((fav) => fav.movieId === id);
      if (favoriteDoc) {
        removeFavorite(favoriteDoc.id); // Pass doc ID here!
      }
    } else {
      addFavorite({
        movieId: id,
        title: title,
        poster: poster_path,
      });
    }
  };

  return (
    <Link
      href={{ pathname: "/movie/[id]", params: { id: String(id) } }}
      asChild
    >
      <TouchableOpacity className="w-[30%] mb-6">
        {/* Image Container with Gradient Overlay */}
        <View className="relative rounded-xl overflow-hidden aspect-[2/3] mb-3">
          <Image
            source={{
              uri: poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
            }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/90 to-transparent" />

          {/* Rating Badge */}
          <View className="absolute top-2 left-2 flex-row items-center bg-black/70 px-2 py-1 rounded-full">
            <Image source={icons.star} className="w-3 h-3 mr-1" />
            <Text className="text-xs text-amber-400 font-bold">
              {vote_average?.toFixed(1)}
            </Text>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            onPress={toggleFavorite}
            className="absolute top-2 right-2 bg-black/60 w-8 h-8 items-center justify-center rounded-full"
            style={{ borderRadius: 20 }}
          >
            <AntDesign
              name={favorite ? "heart" : "hearto"}
              size={16}
              color={favorite ? "#EF4444" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        {/* Movie Info */}
        <Text
          className="text-white font-bold mb-1 text-base"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        <View className="flex-row justify-between items-center">
          <Text className="text-light-300 text-sm">
            {release_date?.split("-")[0] || "N/A"}
          </Text>
          <View className="bg-primary px-2 py-1 rounded-md">
            <Text className="text-white text-xs font-medium">MOVIE</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;

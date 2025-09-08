import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails } from "@/services/api";
import { useEffect } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import AntDesign from "@expo/vector-icons/AntDesign";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

// Fix: explicitly check null/undefined so 0 is rendered and no React error occurs
const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2" numberOfLines={3}>
      {value !== null && value !== undefined ? value : "N/A"}
    </Text>
  </View>
);

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

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    data: movie,
    loading,
    error,
  } = useFetch(() => fetchMovieDetails(id as string));

  useEffect(() => {
    if (movie) {
      console.log("Fetched movie details:", movie);
    }
  }, [movie]);

  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const favorite = isFavorite(id as string);

  const toggleFavorite = () => {
    if (favorite) {
      const favoriteDoc = favorites.find((fav) => fav.movieId === id);
      if (favoriteDoc) {
        removeFavorite(favoriteDoc.id); // Pass doc ID here!
      }
    } else {
      if (movie) {
        addFavorite({
          movieId: id as string,
          title: movie.title,
          poster: movie.poster_path,
        });
      }
    }
  };

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView className="bg-primary flex-1 justify-center items-center px-4">
        <Text className="text-white text-center mb-4">
          Oops! Something went wrong: {error.message}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 bg-accent rounded"
          accessible
          accessibilityLabel="Go back"
        >
          <Text className="text-white font-semibold text-center">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Poster + Play Button */}
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[450px]"
            resizeMode="cover"
          />

          <TouchableOpacity
            className="absolute bottom-5 right-5 rounded-full w-14 h-14 bg-white flex items-center justify-center shadow-lg"
            onPress={() => {
              if (movie?.homepage) {
                Linking.openURL(movie.homepage);
              } else {
                alert("Trailer not available");
              }
            }}
            accessible
            accessibilityLabel="Play trailer"
          >
            <Image
              source={icons.play}
              className="w-6 h-7 ml-1"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Movie Basic Info */}
        <View className="bg-dark-900 rounded-lg p-5 mt-5 mx-4 shadow-md">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-bold text-2xl">
              {movie?.title}
            </Text>
            {/* Favorite Button */}
            <TouchableOpacity
              onPress={toggleFavorite}
              className=" bg-black/60 w-8 h-8 items-center justify-center rounded-full"
              style={{ borderRadius: 20 }}
            >
              <AntDesign
                name={favorite ? "heart" : "hearto"}
                size={20}
                color={favorite ? "#EF4444" : "#FFFFFF"}
              />
            </TouchableOpacity>
          </View>

          {movie?.tagline ? (
            <Text className="text-white font-semibold italic mt-1">
              {movie.tagline}
            </Text>
          ) : null}

          <View className="flex-row items-center gap-x-3 mt-3">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0] || "N/A"}
            </Text>
            <Text className="text-light-200 text-sm">•</Text>
            <Text className="text-light-200 text-sm">
              {formatRuntime(movie?.runtime ?? undefined)}
            </Text>
          </View>

          <View className="flex-row items-center bg-dark-700 rounded-md px-3 py-1 mt-4 w-max shadow-sm">
            <Image source={icons.star} className="w-4 h-4" />
            <Text className="text-white font-semibold ml-2">
              {movie?.vote_average?.toFixed(1) ?? 0}
            </Text>
            <Text className="text-light-300 ml-1">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          {/* Overview */}
          <MovieInfo label="Overview" value={movie?.overview} />

          {/* Genres */}
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          {/* Budget and Revenue */}
          <View className="flex-row justify-between mt-5">
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

          {/* Production Companies with logos */}
          <Text className="text-light-200 font-normal text-sm mt-4">
            Production Companies
          </Text>
          {/* <MovieInfo label="Production Companies" value="" /> */}
          <View className="flex-row flex-wrap gap-4 mt-2">
            {movie?.production_companies?.map((c) => (
              <View
                key={c.id}
                className="flex-row items-center gap-2 max-w-[150px]"
                accessible
                accessibilityLabel={`Production company ${c.name}`}
              >
                {c.logo_path ? (
                  <View className="bg-white rounded-md p-1 shadow-md">
                    <Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w92${c.logo_path}`,
                      }}
                      className="w-10 h-10"
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  // If no logo, just show name in a slightly styled box so it stands out
                  <View className="bg-gray-700 rounded-md px-2 py-1">
                    <Text className="text-light-100 text-sm">{c.name}</Text>
                  </View>
                )}
                {c.logo_path && (
                  <Text className="text-light-100 text-sm flex-shrink max-w-[90px]">
                    {c.name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Go Back Button */}
      <TouchableOpacity
        className="absolute bottom-5 left-5 right-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50 shadow-lg"
        onPress={router.back}
        accessible
        accessibilityLabel="Go back"
      >
        <Image
          source={icons.arrow}
          className="w-5 h-5 mr-2 rotate-180"
          tintColor="#fff"
          resizeMode="contain"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Details;

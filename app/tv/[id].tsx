// app/tv/[id].tsx
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
  import { fetchTVDetails } from "@/services/api";
  import { useFavorites } from "@/contexts/FavoritesContext";
  import AntDesign from "@expo/vector-icons/AntDesign";
  
  interface InfoProps {
    label: string;
    value?: string | number | null;
  }
  
  const InfoRow = ({ label, value }: InfoProps) => (
    <View className="flex-col items-start justify-center mt-5">
      <Text className="text-light-200 font-normal text-sm">{label}</Text>
      <Text className="text-light-100 font-bold text-sm mt-2" numberOfLines={3}>
        {value ?? "N/A"}
      </Text>
    </View>
  );
  
  const formatEpisodesSeasons = (seasons?: number, episodes?: number) => {
    if (!seasons || !episodes) return "N/A";
    return `${seasons} season${seasons > 1 ? "s" : ""}, ${episodes} episode${episodes > 1 ? "s" : ""}`;
  };
  
  const TVDetails = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
  
    const { data: tv, loading, error } = useFetch(() => fetchTVDetails(id as string));
  
    const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();
    const favorite = isFavorite(id as string);
  
    const toggleFavorite = () => {
      if (favorite) {
        const favoriteDoc = favorites.find((fav) => fav.movieId === id);
        if (favoriteDoc) removeFavorite(favoriteDoc.id);
      } else if (tv) {
        addFavorite({
          movieId: id as string,
          title: tv.name,
          poster: tv.poster_path,
        });
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
            onPress={router.back}
            className="px-6 py-3 bg-accent rounded"
          >
            <Text className="text-white font-semibold text-center">Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
  
    return (
      <View className="bg-primary flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Poster */}
          <View>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${tv?.poster_path}`,
              }}
              className="w-full h-[450px]"
              resizeMode="cover"
            />
  
            <TouchableOpacity
              className="absolute bottom-5 right-5 rounded-full w-14 h-14 bg-white flex items-center justify-center shadow-lg"
              onPress={() => {
                if (tv?.homepage) Linking.openURL(tv.homepage);
                else alert("Trailer not available");
              }}
            >
              <Image
                source={icons.play}
                className="w-6 h-7 ml-1"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
  
          {/* TV Basic Info */}
          <View className="bg-dark-900 rounded-lg p-5 mt-5 mx-4 shadow-md">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-2xl">{tv?.name}</Text>
              <TouchableOpacity
                onPress={toggleFavorite}
                className=" bg-black/60 w-8 h-8 items-center justify-center rounded-full"
              >
                <AntDesign
                  name={favorite ? "heart" : "hearto"}
                  size={20}
                  color={favorite ? "#EF4444" : "#FFFFFF"}
                />
              </TouchableOpacity>
            </View>
  
            {tv?.tagline ? (
              <Text className="text-white font-semibold italic mt-1">{tv.tagline}</Text>
            ) : null}
  
            <View className="flex-row items-center gap-x-3 mt-3">
              <Text className="text-light-200 text-sm">
                {tv?.first_air_date?.split("-")[0] || "N/A"}
              </Text>
              <Text className="text-light-200 text-sm">•</Text>
              <Text className="text-light-200 text-sm">
                {formatEpisodesSeasons(tv?.number_of_seasons, tv?.number_of_episodes)}
              </Text>
            </View>
  
            <View className="flex-row items-center bg-dark-700 rounded-md px-3 py-1 mt-4 w-max shadow-sm">
              <Image source={icons.star} className="w-4 h-4" />
              <Text className="text-white font-semibold ml-2">
                {tv?.vote_average?.toFixed(1) ?? 0}
              </Text>
              <Text className="text-light-300 ml-1">({tv?.vote_count} votes)</Text>
            </View>
  
            {/* Overview */}
            <InfoRow label="Overview" value={tv?.overview} />
  
            {/* Genres */}
            <InfoRow
              label="Genres"
              value={tv?.genres?.map((g: any) => g.name).join(" • ") || "N/A"}
            />
  
            {/* Production Companies */}
            <Text className="text-light-200 font-normal text-sm mt-4">
              Production Companies
            </Text>
            <View className="flex-row flex-wrap gap-4 mt-2">
              {tv?.production_companies?.map((c: any) => (
                <View key={c.id} className="flex-row items-center gap-2 max-w-[150px]">
                  {c.logo_path ? (
                    <View className="bg-white rounded-md p-1 shadow-md">
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w92${c.logo_path}` }}
                        className="w-10 h-10"
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
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
  
        {/* Go Back */}
        <TouchableOpacity
          className="absolute bottom-5 left-5 right-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50 shadow-lg"
          onPress={router.back}
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
  
  export default TVDetails;
  
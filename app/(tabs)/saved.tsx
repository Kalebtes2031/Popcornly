import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useFavorites } from "@/contexts/FavoritesContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const Saved = () => {
  const { favorites, loading, removeFavorite } = useFavorites();
  const router = useRouter();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#FF0000" />
        <Text className="text-white mt-4">Loading your favorites...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
              colors={["#0f2027", "#203a43", "#2c5364", "#437057"]}
              className="flex-1 px-4 py-6"
            >
      <Text className="text-white text-3xl font-bold mb-6">My Favorites</Text>

      {favorites.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          {/* <Image 
            source={icons.heartOutline} 
            className="w-24 h-24 mb-6" 
            style={{ tintColor: "#555" }}
          /> */}
          <AntDesign name="heart" size={24} color="#555" />
          <Text className="text-white text-xl font-semibold mb-2">
            No favorites yet
          </Text>
          <Text className="text-gray-400 text-center text-base max-w-[80%]">
            Save movies you love by tapping the heart icon on any movie
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row mb-5 items-center bg-gray-900 rounded-xl p-3"
              onPress={() => {
                const href = `/movies/${item.movieId}` as Href;
                router.push(href);
              }}
              activeOpacity={0.8}
            >
              {item.poster ? (
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w154${item.poster}`,
                  }}
                  className="w-20 h-28 rounded-lg"
                />
              ) : (
                <View className="w-20 h-28 bg-gray-800 rounded-lg justify-center items-center">
                  <Image
                    source={images.rankingGradient}
                    className="w-10 h-10"
                    style={{ tintColor: "#555" }}
                  />
                </View>
              )}

              <View className="ml-4 flex-1">
                <Text
                  className="text-white font-bold text-lg mb-1"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Image source={icons.star} className="w-4 h-4 mr-1" />
                  <Text className="text-amber-400 text-sm">Saved</Text>
                </View>
              </View>

              <TouchableOpacity
                className="ml-2"
                onPress={() => removeFavorite(item.id)}
                activeOpacity={0.7}
              >
                {/* <Image 
                  source={icons.trash} 
                  className="w-6 h-6" 
                  style={{ tintColor: "#EF4444" }}
                /> */}
                <FontAwesome name="trash" size={24} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </LinearGradient>
  );
};

export default Saved;

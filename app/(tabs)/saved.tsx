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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";

import { COLORS, COMMON_STYLES, TYPOGRAPHY } from "@/constants/Styles";

const Saved = () => {
  const { favorites, loading, removeFavorite } = useFavorites();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading your favorites...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={[COMMON_STYLES.container, styles.container]}
    >
      <Text style={styles.headerTitle}>My Favorites</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AntDesign name="heart" size={64} color="rgba(255, 255, 255, 0.2)" />
          <Text style={styles.emptyTitle}>
            No favorites yet
          </Text>
          <Text style={styles.emptySubtitle}>
            Save movies you love by tapping the heart icon on any movie
          </Text>
        </View>
      ) : (
        <FlashList
          estimatedItemSize={120}
          data={favorites}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.favoriteCard}
              onPress={() => {
                const href = `/movies/${item.itemId}` as Href;
                router.push(href);
              }}
              activeOpacity={0.8}
            >
              {item.poster ? (
                <Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w154${item.poster}`,
                  }}
                  style={styles.posterImage}
                />
              ) : (
                <View style={[styles.posterImage, styles.posterPlaceholder]}>
                  <Image
                    source={images.rankingGradient}
                    style={styles.placeholderIcon}
                    tintColor="rgba(255, 255, 255, 0.3)"
                  />
                </View>
              )}

              <View style={styles.infoContainer}>
                <Text
                  style={styles.itemTitle}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View style={styles.savedBadge}>
                  <Image source={icons.star} style={styles.starIcon} />
                  <Text style={styles.savedText}>Saved</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFavorite(item.id)}
                activeOpacity={0.7}
              >
                <FontAwesome name="trash" size={20} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: TYPOGRAPHY.title,
    marginBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: TYPOGRAPHY.title,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    textAlign: "center",
    fontSize: 16,
    maxWidth: "80%",
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: 100,
  },
  favoriteCard: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  posterImage: {
    width: 70,
    height: 100,
    borderRadius: 12,
  },
  posterPlaceholder: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    width: 32,
    height: 32,
  },
  infoContainer: {
    marginLeft: 16,
    flex: 1,
  },
  itemTitle: {
    color: COLORS.text,
    fontFamily: TYPOGRAPHY.title,
    fontSize: 17,
    marginBottom: 4,
  },
  savedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  starIcon: {
    width: 12,
    height: 12,
    marginRight: 4,
  },
  savedText: {
    color: "#FBBD23",
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "rgba(255, 111, 97, 0.1)",
    borderRadius: 12,
  },
});

export default Saved;

import React, { useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  StyleSheet,
  Animated 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Link } from "expo-router";
import { TrendingItem } from "@/services/api";

const { width } = Dimensions.get("window");
export const ITEM_WIDTH = Math.round(width * 0.72);

const PLACEHOLDER = "https://placehold.co/600x400/1a1a1a/FFFFFF.png";

type TrendingCardProps = {
  item: TrendingItem;
  isActive: boolean;
};

const TrendingCard: React.FC<TrendingCardProps> = ({ item, isActive }) => {
  const { id, title, poster_url, type } = item;
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isActive ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false, // shadows & elevation don't support native driver
    }).start();
  }, [isActive]);

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.4],
  });

  const shadowRadius = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  const elevation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [5, 15],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          shadowOpacity,
          shadowRadius,
          elevation,
        },
      ]}
    >
      <Link
        href={{
          pathname: type === "tv" ? "/tv/[id]" : "/movie/[id]",
          params: { id: String(id) },
        }}
        asChild
      >
        <TouchableOpacity activeOpacity={0.9} style={styles.touchable}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: poster_url || PLACEHOLDER }}
              style={styles.image}
              resizeMode="cover"
            />
            
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.8)"]}
              style={styles.gradient}
            >
              <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                  {title || "Untitled"}
                </Text>

                <View style={styles.badges}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          type === "movie" 
                            ? "rgba(59,130,246,0.8)" 
                            : "rgba(139,92,246,0.8)",
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {type === "movie" ? "MOVIE" : "TV SHOW"}
                    </Text>
                  </View>
                  <View style={styles.trendingBadge}>
                    <Ionicons name="trending-up" size={12} color="#000" />
                    <Text style={styles.trendingText}>TRENDING</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Link>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    // backgroundColor: "#fff",
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 6,
    // },
    // overflow: "hidden",
  },
  touchable: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
    justifyContent: "flex-end",
    padding: 16,
  },
  content: {
    paddingBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 4,
  },
  trendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  trendingText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default TrendingCard;

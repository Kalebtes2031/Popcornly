import React, { useRef, useState } from "react";
import { 
  View, 
  Dimensions, 
  StyleSheet,
  Animated,
  Platform 
} from "react-native";
import TrendingCard, { ITEM_WIDTH } from "./TrendingCard";
import { TrendingItem } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SPACING = 16;

type TrendingCarouselProps = {
  items: TrendingItem[];
};

const TrendingCarousel: React.FC<TrendingCarouselProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={items}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        horizontal
        pagingEnabled
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate={Platform.OS === "ios" ? 0 : 0.98}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 2) * (ITEM_WIDTH + SPACING),
            (index - 1) * (ITEM_WIDTH + SPACING),
            index * (ITEM_WIDTH + SPACING),
            (index + 1) * (ITEM_WIDTH + SPACING),
            (index + 2) * (ITEM_WIDTH + SPACING),
          ];

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [0, -40, -40, -40, 0],
            extrapolate: "clamp",
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 0.9, 1, 0.9, 0.85],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 0.7, 1, 0.7, 0.6],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  transform: [{ translateY }, { scale }],
                  opacity,
                  width: ITEM_WIDTH,
                },
              ]}
            >
              <TrendingCard 
                item={item} 
                isActive={activeIndex === index}
              />
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  flatListContent: {
    alignItems: "center",
    paddingHorizontal: (SCREEN_WIDTH - ITEM_WIDTH) / 2,
    
  },
  cardWrapper: {
    marginHorizontal: SPACING / 2,
    height: ITEM_WIDTH * 1.6, // aspect ratio
  },
});

export default TrendingCarousel;

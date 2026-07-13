import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../../constants/colors';
import { fonts, radius } from '../../constants/layout';
import type { OnboardingStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type SlidesNavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Slides'>;

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  // Drop real photography into src/assets/onboarding/ and swap these in.
  // Until then each slide falls back to its gradient below.
  image: number | null;
  gradient: [string, string, string];
};

const slides: Slide[] = [
  {
    id: 'stars',
    eyebrow: 'GHANA PREMIER LEAGUE',
    title: 'Home of the most talented stars',
    description: 'Every goal, every save, every story — from the heart of Ghanaian football.',
    image: require('../../assets/onboarding/slide-1-stars.jpg'),
    gradient: [Colors.black, Colors.surface2, Colors.black],
  },
  {
    id: 'live-match',
    eyebrow: 'LIVE THE MATCH',
    title: 'Feel the game like never before',
    description: 'Bolt-fast score updates, Fantasy football, and an all-new Predictions game.',
    image: require('../../assets/onboarding/slide-2-pitch.jpg'),
    gradient: [Colors.surface, Colors.black, Colors.surface2],
  },
  {
    id: 'inside-club',
    eyebrow: 'INSIDE THE CLUB',
    title: 'Exclusive content from your club',
    description: 'Hand-picked stories, interviews and behind-the-scenes from your favourite club.',
    image: require('../../assets/onboarding/slide-3-feed.jpg'),
    gradient: [Colors.black, Colors.surface, Colors.black],
  },
];

export default function OnboardingSlides() {
  const navigation = useNavigation<SlidesNavigationProp>();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setCurrentIndex(clamped);
  };

  const handleGetStarted = () => {
    navigation.navigate('RegisterLogin');
  };

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const isLastSlide = currentIndex === slides.length - 1;

  const renderBackdrop = (slide: Slide, children: React.ReactNode) => {
    if (slide.image) {
      return (
        <ImageBackground source={slide.image} style={styles.slideBackdrop} resizeMode="cover">
          <LinearGradient
            colors={['rgba(10,10,10,0.1)', Colors.black]}
            style={StyleSheet.absoluteFill}
          />
          {children}
        </ImageBackground>
      );
    }
    return (
      <LinearGradient colors={slide.gradient} style={styles.slideBackdrop}>
        {children}
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.wordmark}>
          GPL<Text style={{ color: Colors.yellow }}>Live</Text>
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RegisterLogin')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slides}
        ref={listRef}
        style={styles.list}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item }) =>
          renderBackdrop(
            item,
            <View style={styles.slideTextBlock}>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )
        }
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.pagination}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[styles.dot, currentIndex === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          {currentIndex > 0 ? (
            <TouchableOpacity onPress={() => goTo(currentIndex - 1)} hitSlop={12}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {isLastSlide ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <Text style={styles.primaryButtonText}>Enter GPLLive  →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={() => goTo(currentIndex + 1)}>
              <Text style={styles.primaryButtonText}>Next  →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  list: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 16,
    color: Colors.white,
  },
  skipText: { color: Colors.yellow, fontSize: 14, fontWeight: '700' },
  slideBackdrop: {
    width,
    flex: 1,
    justifyContent: 'flex-end',
  },
  slideTextBlock: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  eyebrow: {
    color: Colors.yellow,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: Colors.white,
    textTransform: 'uppercase',
    lineHeight: 32,
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    color: Colors.grey1,
    lineHeight: 22,
    maxWidth: '90%',
  },
  footer: { paddingHorizontal: 24, paddingTop: 24 },
  pagination: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.grey2,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.yellow,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: { color: Colors.grey1, fontSize: 14, fontWeight: '600' },
  primaryButton: {
    backgroundColor: Colors.yellow,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.button,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontFamily: fonts.display,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
});
